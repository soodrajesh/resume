# Resume Generator

Generates a professional resume as HTML and PDF from a single JavaScript source.

## Quick Start

```bash
npm install
node resume.js
```

## Output Files

- `resume.html` — Interactive HTML version (view in any browser)
- `Rajesh_Sood_Resume_2026.pdf` — PDF export (ready to send/print)
- `Rajesh_Sood_Resume_2026.docx` — Editable Word version (open, tweak, re-save as PDF if needed)

## Editing

All resume content — name, summary, metrics, competencies, certifications, job history, education — lives in one place: the `CONTENT` object near the top of `resume.js`. Edit it once; `resume.html`, the PDF, and the docx are all rendered from that same object, so they can't drift out of sync with each other. Re-run `node resume.js` to regenerate all three.

Bullet points are plain `"Label: rest of sentence"` strings — both renderers bold everything before the first colon automatically.

The script uses Puppeteer to render HTML to a pixel-perfect PDF, and the `docx` library to build the Word version natively from the same `CONTENT` object (not converted from the HTML), so all three outputs share identical text, colors, and structure.
