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

The HTML/PDF and the docx are built from two independent content blocks in `resume.js` — the HTML template string and the `generateDocx()` function. Editing one does not update the other; update both if you change content. Re-run `node resume.js` to regenerate all three files.

The script uses Puppeteer to render the HTML to a pixel-perfect PDF, and the `docx` library to build the Word version natively (not converted from the HTML), so both share the same colors and structure but are generated independently.
