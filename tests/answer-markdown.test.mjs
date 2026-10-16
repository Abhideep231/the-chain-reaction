// Run: node --test tests/answer-markdown.test.mjs
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {test} from 'node:test'
import vm from 'node:vm'
import {renderToStaticMarkup} from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const exports = {}
const source = readFileSync(new URL('../src/components/chat/answer-markdown.tsx', import.meta.url), 'utf8')
vm.runInNewContext(ts.transpileModule(source, {compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
}}).outputText, {
  exports,
  require: name => name === 'react-markdown' ? {__esModule: true, default: ReactMarkdown}
    : name === 'remark-gfm' ? {__esModule: true, default: remarkGfm} : require(name),
})

test('engineering Markdown tables render as accessible scrollable HTML tables', () => {
  const html = renderToStaticMarkup(exports.AnswerMarkdown({text:
    'Catalogue page 16\n\n| Chain | Pitch (mm) |\n|---|---|\n| 16B-1 | 25.40 |',
  }))
  assert.match(html, /<table/)
  assert.match(html, /<th[^>]*>Pitch \(mm\)<\/th>/)
  assert.match(html, /<td[^>]*>25.40<\/td>/)
  assert.match(html, /overflow-x-auto/)
  assert.match(html, /aria-label="Answer table"/)
})

test('raw HTML and unsafe link URLs from answers are not executed or rendered', () => {
  const html = renderToStaticMarkup(exports.AnswerMarkdown({text:
    '<script>alert(1)</script>\n\n[click](javascript:alert%281%29)\n\n**Safe text**',
  }))
  assert.doesNotMatch(html, /<script|javascript:/)
  assert.match(html, /<strong>Safe text<\/strong>/)
})
