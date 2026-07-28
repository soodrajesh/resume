# Resume Generator

Generates a professional resume as HTML and PDF from a single JavaScript source.

## Quick Start

```bash
npm install
node resume.js
```

## Output Files

- `resume.html` — Interactive HTML version (view in any browser)
- `Rajesh_Sood_Resume_2025.pdf` — PDF export (ready to send/print)

## Editing

Edit content directly in `resume.js`. All styling, layout, and typography are defined in the HTML template. Re-run `node resume.js` to regenerate both files.

The script uses Puppeteer to render the HTML to a pixel-perfect PDF, ensuring consistency between the web and print versions.
