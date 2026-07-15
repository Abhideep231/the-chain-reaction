import type { EngineeringAnswer, RetrievedDocument } from "@/types/chat"

/**
 * Static, hand-authored mock data for the Ask AI workspace.
 * There is no model or retrieval pipeline behind this yet — Sprint 2 is
 * frontend-only. Every answer below is a canned response keyed to a
 * suggested prompt, plus a generic fallback for freeform questions.
 */

export const suggestedPrompts: string[] = [
  "What is the maximum allowable elongation for an ANSI 60 roller chain before replacement?",
  "Why is my conveyor chain wearing prematurely at the sprocket mesh?",
  "Compare the tensile strength of ISO 10B-1 and ANSI 80 roller chains.",
  "What lubrication interval is recommended for a chain running at 900 RPM in a dusty environment?",
]

const documentLibrary: Record<string, RetrievedDocument> = {
  ansiB29: {
    id: "doc-ansi-b29-1",
    name: "ANSI/ASME B29.1 — Precision Power Transmission Roller Chains",
    type: "Industry Standard",
    matchScore: 94,
  },
  iso606: {
    id: "doc-iso-606",
    name: "ISO 606:2015 — Short-Pitch Transmission Precision Roller Chains",
    type: "Industry Standard",
    matchScore: 88,
  },
  wearGuide: {
    id: "doc-wear-guide",
    name: "Chain Wear & Elongation Field Guide, Rev. 4",
    type: "Internal Manual",
    matchScore: 82,
  },
  lubeGuide: {
    id: "doc-lube-guide",
    name: "Sprocket Alignment & Lubrication Best Practices",
    type: "Internal Manual",
    matchScore: 77,
  },
  failureAnalysis: {
    id: "doc-failure-analysis",
    name: "Failure Analysis Casebook: Sprocket Mesh Wear Patterns",
    type: "Internal Manual",
    matchScore: 85,
  },
}

interface MockEntry {
  match: (prompt: string) => boolean
  answer: EngineeringAnswer
}

const entries: MockEntry[] = [
  {
    match: (p) => /elongation|ansi 60|replace/i.test(p),
    answer: {
      summary:
        "For an ANSI 60 roller chain, replace the chain once measured elongation exceeds 1.5% of its original length on a straight-run drive, or 3% on a chain with an adjustable takeup. Beyond this point, the chain rides increasingly higher on the sprocket tooth profile, accelerating tooth wear and raising the risk of jumping teeth under shock load.\n\nMeasure elongation over a span of at least 20 links (roughly 610 mm for 60-pitch chain) rather than a single pitch, since localized wear can mask overall stretch.",
      confidence: "high",
      parameters: [
        { label: "Chain number", value: "ANSI 60" },
        { label: "Pitch", value: "19.05 mm (3/4 in)" },
        { label: "Max elongation — fixed centers", value: "1.5%" },
        { label: "Max elongation — adjustable takeup", value: "3.0%" },
        { label: "Recommended measuring span", value: "≥ 20 links" },
      ],
      citations: [
        {
          id: "c1",
          title: "Wear elongation limits by drive configuration",
          source: documentLibrary.wearGuide.name,
          section: "Section 3.2 — Elongation Thresholds",
          snippet:
            "\"Chains operating on fixed-center drives should be replaced at 1.5% elongation; chains with center-distance adjustment may run to 3.0% before tooth engagement becomes unreliable.\"",
          relevance: 96,
        },
        {
          id: "c2",
          title: "Measurement span requirements",
          source: documentLibrary.ansiB29.name,
          section: "Section 5 — Wear Allowance",
          snippet:
            "\"Elongation shall be measured over a minimum span of 20 pitches to average out localized pin and bushing wear.\"",
          relevance: 91,
        },
      ],
      retrievedDocuments: [
        documentLibrary.wearGuide,
        documentLibrary.ansiB29,
        documentLibrary.iso606,
      ],
    },
  },
  {
    match: (p) => /premature|sprocket mesh|wear/i.test(p),
    answer: {
      summary:
        "Premature wear concentrated at the sprocket mesh point is most commonly caused by one of three factors: misalignment between shafts, insufficient or contaminated lubrication reaching the pin-bushing interface, or a worn sprocket tooth profile that no longer matches an already-elongated chain.\n\nStart by checking sprocket alignment with a straightedge or laser alignment tool across both shafts — more than 0.5° of angular misalignment will load one side of the chain preferentially. If alignment is within tolerance, inspect the tooth profile for the characteristic \"hooked\" wear pattern, which indicates the sprocket and chain are wearing each other faster than either would alone.",
      confidence: "medium",
      parameters: [
        { label: "Max angular misalignment", value: "0.5°" },
        { label: "Max parallel offset", value: "1/4 of pitch length" },
        { label: "Typical root cause (this pattern)", value: "Misalignment or worn sprocket" },
      ],
      citations: [
        {
          id: "c1",
          title: "Hooked tooth wear pattern diagnosis",
          source: documentLibrary.failureAnalysis.name,
          section: "Case 7 — Accelerated Mesh Wear",
          snippet:
            "\"A hooked wear profile on the driving face of the sprocket tooth is diagnostic of an already-elongated chain riding high on the tooth, compounding wear on both components.\"",
          relevance: 93,
        },
        {
          id: "c2",
          title: "Alignment tolerance for roller chain drives",
          source: documentLibrary.lubeGuide.name,
          section: "Section 1 — Alignment",
          snippet:
            "\"Shaft parallelism should be held within 1/4 pitch length across the sprocket face width; angular misalignment should not exceed 0.5 degrees.\"",
          relevance: 89,
        },
      ],
      retrievedDocuments: [
        documentLibrary.failureAnalysis,
        documentLibrary.lubeGuide,
        documentLibrary.wearGuide,
      ],
    },
  },
  {
    match: (p) => /tensile|10b-1|iso.*80|80.*iso|compare/i.test(p),
    answer: {
      summary:
        "ISO 10B-1 and ANSI 80 are close but not identical — they share the same 15.875 mm (5/8 in) pitch, but differ slightly in roller diameter and minimum tensile strength due to differing bushing and roller tolerances between the ISO and ANSI standards.\n\nWhen retrofitting an ANSI-spec drive with ISO chain (or vice versa), verify sprocket tooth form compatibility as well — the two standards specify slightly different tooth profiles at this pitch.",
      confidence: "high",
      parameters: [
        { label: "ISO 10B-1 pitch", value: "15.875 mm" },
        { label: "ANSI 80 pitch", value: "15.875 mm (5/8 in)" },
        { label: "ISO 10B-1 min. tensile strength", value: "22.2 kN" },
        { label: "ANSI 80 min. tensile strength", value: "31.8 kN" },
        { label: "ISO 10B-1 roller diameter", value: "10.16 mm" },
        { label: "ANSI 80 roller diameter", value: "11.91 mm" },
      ],
      citations: [
        {
          id: "c1",
          title: "ISO 10B-1 dimensional and strength table",
          source: documentLibrary.iso606.name,
          section: "Table 2 — Series B Chains",
          snippet:
            "\"10B-1: pitch 15.875 mm, roller diameter 10.16 mm, minimum tensile strength 22.2 kN.\"",
          relevance: 95,
        },
        {
          id: "c2",
          title: "ANSI 80 dimensional and strength table",
          source: documentLibrary.ansiB29.name,
          section: "Table 1 — Standard Series",
          snippet:
            "\"No. 80: pitch 1 in x 5/8 in... roller diameter 0.469 in, average tensile strength 7,150 lbf (31.8 kN).\"",
          relevance: 94,
        },
      ],
      retrievedDocuments: [
        documentLibrary.iso606,
        documentLibrary.ansiB29,
      ],
    },
  },
  {
    match: (p) => /lubricat|900 rpm|dusty|interval/i.test(p),
    answer: {
      summary:
        "At 900 RPM in a dusty environment, manual drip or brush lubrication is not enough — abrasive particulate will combine with surface oil to form a grinding paste at the pin-bushing joint faster than it can be replenished. Move to a filtered, enclosed oil-bath or forced-drip system if the drive layout allows it.\n\nIf the chain must remain in an open drive, shorten the manual re-lubrication interval to every 8 operating hours, and add a wipe-down step to remove accumulated grit before each application rather than lubricating over it.",
      confidence: "medium",
      parameters: [
        { label: "Speed", value: "900 RPM" },
        { label: "Environment", value: "Dusty / abrasive" },
        { label: "Recommended method", value: "Enclosed oil bath or forced drip" },
        { label: "Open-drive fallback interval", value: "Every 8 operating hours" },
      ],
      citations: [
        {
          id: "c1",
          title: "Lubrication method selection by environment",
          source: documentLibrary.lubeGuide.name,
          section: "Section 4 — Environmental Considerations",
          snippet:
            "\"In abrasive or dusty environments, open manual lubrication should be considered a last resort; enclosed bath or forced-feed systems dramatically reduce contamination-driven wear.\"",
          relevance: 90,
        },
        {
          id: "c2",
          title: "Speed-based lubrication frequency",
          source: documentLibrary.ansiB29.name,
          section: "Section 7 — Lubrication",
          snippet:
            "\"Chain speeds above 800 RPM at this pitch fall into the Type C (forced) lubrication category under normal conditions.\"",
          relevance: 84,
        },
      ],
      retrievedDocuments: [
        documentLibrary.lubeGuide,
        documentLibrary.ansiB29,
      ],
    },
  },
]

const fallbackAnswer: EngineeringAnswer = {
  summary:
    "Based on the retrieved reference material, here is a general engineering summary for this question. This workspace currently uses a fixed set of demo answers — connect a retrieval and reasoning backend to replace this with a live response grounded in your own document set.",
  confidence: "low",
  citations: [
    {
      id: "c1",
      title: "General roller chain reference",
      source: documentLibrary.ansiB29.name,
      section: "Section 1 — Scope",
      snippet:
        "\"This standard covers dimensions, tolerances, and ratings for precision power transmission roller chains.\"",
      relevance: 62,
    },
  ],
  retrievedDocuments: [documentLibrary.ansiB29, documentLibrary.iso606],
}

export function getMockAnswer(prompt: string): EngineeringAnswer {
  const entry = entries.find((item) => item.match(prompt))
  return entry?.answer ?? fallbackAnswer
}
