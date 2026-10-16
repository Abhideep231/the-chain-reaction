// Run: node --test tests/upload.test.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const MiB = 1024 * 1024
function loadUpload(postForm) {
  const source = readFileSync(new URL('../src/lib/api/documents.ts', import.meta.url), 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  const exports = {}
  class ApiError extends Error {}
  vm.runInNewContext(code, {
    exports, FormData, crypto,
    require: (name) => {
      if (name === '@/lib/api/client') return { apiClient: { postForm } }
      if (name === '@/lib/api/errors') return { ApiError }
      if (name === '@/lib/api/config') return { UPLOAD_TIMEOUT_MS: 300000 }
      throw new Error(`Unexpected module: ${name}`)
    },
  })
  return exports.uploadPdf
}

test('large file survives a proxy that rejects requests over 2 MiB', async () => {
  const bytes = Buffer.alloc(21772607, 42)
  bytes.write('%PDF-')
  const received = []
  let uploadId
  const upload = loadUpload(async (path, form) => {
    assert.equal(path, '/documents/upload-chunk')
    const wire = new Request('http://localhost', { method: 'POST', body: form })
    assert.ok((await wire.arrayBuffer()).byteLength < 2 * MiB)
    assert.equal(form.get('chunk_index'), String(received.length))
    assert.equal(form.get('total_size'), String(bytes.length))
    uploadId ??= form.get('upload_id')
    assert.equal(form.get('upload_id'), uploadId)
    received.push(Buffer.from(await form.get('file').arrayBuffer()))
    return received.length === Math.ceil(bytes.length / MiB)
      ? { id: 'catalogue', status: 'processing' } : { status: 'uploading' }
  })
  const result = await upload(new File([bytes], 'catalogue.pdf', { type: 'application/pdf' }))
  assert.equal(result.id, 'catalogue')
  assert.equal(received.length, 21)
  assert.deepEqual(Buffer.concat(received), bytes)
})

test('small PDFs retain the original upload endpoint', async () => {
  const upload = loadUpload(async (path) => {
    assert.equal(path, '/documents/upload')
    return { id: 'small', status: 'processing' }
  })
  assert.equal((await upload(new File(['%PDF-'], 'small.pdf'))).id, 'small')
})

test('files over 25 MiB are rejected without network requests', async () => {
  const upload = loadUpload(() => assert.fail('Should not send oversized files'))
  await assert.rejects(upload(new File([new Uint8Array(25 * MiB + 1)], 'large.pdf')), /25 MB/)
})

test('a failed chunk stops the transfer before subsequent chunks', async () => {
  let calls = 0
  const upload = loadUpload(async () => { calls++; throw new Error('connection failed') })
  await assert.rejects(upload(new File([new Uint8Array(3 * MiB)], 'large.pdf')), /connection failed/)
  assert.equal(calls, 1)
})
