const puppeteer = require('puppeteer');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, BorderStyle, WidthType, ShadingType,
  VerticalAlign, TabStopType,
} = require('docx');
const fs = require('fs');

const COLORS = {
  primary:  '#1B3A6B',
  accent:   '#2E75B6',
  light:    '#D6E4F0',
  text:     '#1A1A1A',
  subtext:  '#555555',
};

// docx doesn't accept a leading '#' on hex colors
const DOCX_COLORS = Object.fromEntries(
  Object.entries(COLORS).map(([k, v]) => [k, v.replace('#', '')])
);

// ── single source of truth for resume content ───────────────────────────────
// Edit this object only. Both the HTML/PDF and the docx are rendered from it,
// so the two output formats can never drift out of sync with each other.
const CONTENT = {
  name: 'RAJESH SOOD',
  credential: 'MBA',
  tagline: 'Senior Cloud & DevOps Engineer · AI/ML Platform Engineering · AWS · Kubernetes · Terraform · SRE',
  contact: {
    email: 'soodrajesh87@gmail.com',
    linkedin: 'linkedin.com/in/rajeshsood',
    github: 'github.com/soodrajesh',
    location: 'Dublin, Ireland',
  },

  summary: [
    'With over 15 years of enterprise cloud experience, I architect the platforms that engineering teams rely on to ship fast, stay resilient, and scale without surprises.',
    'I lead DevOps and AI/ML platform engineering across multi-account AWS — building the infrastructure that powers internal AI products, documentation platforms, and GenAI integrations at enterprise scale. Alongside that, I set reliability standards across critical AWS workloads, own incident response frameworks, and drive FinOps governance that has compounded to $200K+ in cloud cost savings.',
    'Technical depth spans cloud architecture, Kubernetes, Terraform, SRE, and AI-augmented engineering — using Claude, Bedrock, and GitHub Copilot as everyday tools for IaC generation, log analysis, and automated remediation workflows.',
  ],

  metrics: [
    { value: '$200K+', label: 'Cloud Cost Savings' },
    { value: '99.99%', label: 'Uptime SLA Delivered' },
    { value: '35%', label: 'Faster Deploy Cycles' },
  ],

  competencies: [
    { label: 'AI/ML Platform:', value: 'AWS SageMaker, AWS Bedrock, RAG Pipeline Design, LLM Integration (Claude, Titan), GenAI Ops' },
    { label: 'Cloud Architecture:', value: 'AWS (EKS, Networking, Serverless) · Azure · GCP · OCI — multi-region, multi-account' },
    { label: 'Platform Eng & IaC:', value: 'Terraform, CloudFormation, Helm, Ansible — Internal developer platforms · Self-service infra' },
    { label: 'SRE & Reliability:', value: 'SLO/SLI/Error-budget design · Incident command · Splunk, Datadog, Prometheus/Grafana' },
    { label: 'CI/CD & DevOps:', value: 'Jenkins, GitHub Actions · Shift-left testing · 35% cycle-time reduction achieved' },
    { label: 'Security/Compliance:', value: 'DevSecOps (Wiz, Snyk, SonarQube) · IAM zero-trust design · GDPR, SOC 2, HIPAA · Automated remediation pipelines' },
    { label: 'AI-Augmented Eng:', value: 'GitHub Copilot, Cursor, Claude/Bedrock — IaC generation, log analysis, vulnerability auto-remediation workflows' },
  ],

  certifications: {
    primary: 'AWS Certified Solutions Architect – Professional',
    primaryMeta: '(Valid Dec 2026)',
    credlyUrl: 'credly.com/users/rajeshsood',
    previous: 'Previously Certified: Microsoft Azure (Exam 533) · Google Cloud Professional Architect · Oracle OCI Architect Professional & Associate',
  },

  experience: [
    {
      title: 'Senior DevOps Engineer', company: 'Workday', location: 'Dublin, Ireland', dates: 'Oct 2023 – Present',
      intro: "Leading DevOps and AI/ML platform engineering within Workday's enterprise AWS environment, enabling internal product and documentation teams.",
      bullets: [
        "AI/ML Platform Architecture: Designed and deployed SageMaker infrastructure enabling internal AI/ML teams to build, version, and serve models against Workday's documentation data — reducing model deployment lead time by 40%.",
        'Generative AI Integration: Engineered serverless RAG pipelines and GenAI workflows via AWS Bedrock (Claude, Titan) powering internal AI chatbots and documentation search applications — spanning prompt engineering, vector search, and production observability.',
        'SRE & Reliability: Owned SLO/SLI framework and incident response for critical EKS microservices, maintaining 99.99% uptime through capacity planning and structured on-call rotation.',
        'Platform Modernisation: Redesigned CI/CD workflows (Jenkins + GitHub Actions) and IaC standards (Terraform/Helm), delivering a 35% reduction in deployment cycle time across all squads.',
        'Security Automation: Built AI-powered vulnerability remediation pipelines using Claude/Bedrock to auto-analyse PRs & Wiz findings and generate validated Terraform fixes — cutting mean remediation time by 60%.',
        'FinOps Governance: Implemented cloud cost standards across multi-account AWS, driving $100K+ in cumulative savings through rightsizing, RI strategy, and anomaly detection automation.',
        'AI-Augmented Velocity: Drove 25% acceleration in IaC delivery through team-wide adoption of GitHub Copilot and Cursor tooling.',
      ],
    },
    {
      title: 'Cloud Infrastructure Engineer (SRE)', company: 'Protego Technologies', location: 'Dublin, Ireland', dates: 'Sep 2022 – Oct 2023',
      bullets: [
        'Observability Architecture: Built global observability stack (Splunk + Datadog + Prometheus) with SLO/SLI alerting, reducing MTTR by 45% across high-availability financial services workloads.',
        'Security Posture: Integrated Snyk and OWASP ZAP into automated pipelines as shift-left controls, reducing production vulnerabilities by 40%.',
        'Reliability Engineering: Owned EKS cluster operations for HA financial services — capacity planning, incident command, and runbook-driven on-call rotation.',
      ],
    },
    {
      title: 'Cloud SysOps Engineer (Lead)', company: 'Hilti Asia IT Services', location: 'Kuala Lumpur, Malaysia', dates: 'Dec 2019 – Aug 2022',
      bullets: [
        'Cost Optimisation: Delivered $120K in annual savings through Reserved Instance strategy and resource lifecycle automation across multi-region AWS.',
        'Global Standardisation: Authored CloudFormation templates enforcing security and compliance baselines across 10+ AWS regions and business units.',
        'Compliance Leadership: Led IAM governance program ensuring controls met enterprise SOC 2 and internal audit standards.',
      ],
    },
    {
      title: 'Cloud Service Engineer', company: 'MAXIS Sdn Bhd', location: 'Kuala Lumpur, Malaysia', dates: 'Jul 2018 – Dec 2019',
      bullets: [
        'Scale Migration: Architected and migrated 30+ enterprise applications to AWS with HA/DR configurations and zero-downtime cutovers.',
        'RI Strategy: Spearheaded Reserved Instance purchasing program, reducing cloud expenditure by 15% ($80K annually).',
      ],
    },
    {
      title: 'IT Service Delivery Consultant III (L3)', company: 'DXC Technology (formerly HPE)', location: 'Cyberjaya, Malaysia', dates: 'Feb 2017 – Jun 2018',
      bullets: [
        'Multi-Cloud Operations: Provided L3 architectural support across hybrid environments (AWS, Hyper-V, VMware), managing 300+ EC2 instances across 8 enterprise accounts.',
        'Automation: Developed health-check and remediation scripts that significantly reduced application downtime and manual escalation.',
      ],
    },
  ],

  earlierCareer: [
    'Senior VMware Administrator (L3) · Softenger Malaysia (HPE client) · Oct 2016 – Jan 2017',
    'Senior IT OS Analyst · Optum / UnitedHealth Group, Noida · Nov 2014 – Oct 2016 — IaaS automation with HP BSA Suite; vSphere and vRealize Automation for self-service provisioning.',
    'Associate Professional · CSC India (now DXC) · Oct 2012 – Nov 2014 — Windows/Linux environments and VMware vSphere administration.',
    'Dell International & HCL India · Jul 2010 – Oct 2012 — Enterprise technical support, Active Directory, and network device administration.',
  ],

  education: [
    { degree: 'MBA in Information Technology', school: 'Sikkim Manipal University, India', year: '2015' },
    { degree: 'B.E. in Computer Science', school: 'Visvesvaraya Technological University, Karnataka, India', year: '2010' },
  ],
};

// Bullets are stored as plain "Label: rest of sentence" strings. Both
// renderers split on the same rule to bold the label — one definition,
// two outputs.
function splitBoldLabel(text) {
  const colonIdx = text.indexOf(':');
  if (colonIdx > -1 && colonIdx < 55) {
    return { label: text.slice(0, colonIdx + 1), rest: text.slice(colonIdx + 1) };
  }
  return { label: null, rest: text };
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── HTML/PDF renderer ────────────────────────────────────────────────────────
function htmlBullet(text) {
  const { label, rest } = splitBoldLabel(text);
  const body = label
    ? `<strong>${escapeHtml(label)}</strong>${escapeHtml(rest)}`
    : escapeHtml(rest);
  return `    <div class="bullet">${body}</div>`;
}

function buildHtml(c) {
  const competencyRows = c.competencies
    .map(({ label, value }) => `    <tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join('\n');

  const metricDivs = c.metrics
    .map(({ value, label }) => `    <div class="metric">
      <div class="metric-value">${escapeHtml(value)}</div>
      <div class="metric-label">${escapeHtml(label)}</div>
    </div>`)
    .join('\n');

  const experienceHtml = c.experience
    .map(job => {
      const introHtml = job.intro
        ? `  <div class="job-intro">${escapeHtml(job.intro)}</div>\n`
        : '';
      const bulletsHtml = job.bullets.map(htmlBullet).join('\n');
      return `  <div class="job-header">
    <span class="job-left"><span class="job-title">${escapeHtml(job.title)}</span> · <span class="job-company">${escapeHtml(job.company)}</span> · <span class="job-loc">${escapeHtml(job.location)}</span></span>
    <span class="job-dates">${escapeHtml(job.dates)}</span>
  </div>
${introHtml}  <div class="bullets">
${bulletsHtml}
  </div>`;
    })
    .join('\n\n');

  const earlierHtml = c.earlierCareer
    .map(item => `    <div class="earlier-item">${escapeHtml(item)}</div>`)
    .join('\n');

  const educationHtml = c.education
    .map(({ degree, school, year }) => `  <div class="education">
    <span><strong>${escapeHtml(degree)}</strong> · ${escapeHtml(school)}</span>
    <span class="edu-right">${escapeHtml(year)}</span>
  </div>`)
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(c.name)} Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.4; color: ${COLORS.text}; }

    .header { border-bottom: 2.5pt solid ${COLORS.primary}; padding-bottom: 8pt; margin-bottom: 10pt; }
    .name { font-size: 26pt; font-weight: 800; color: ${COLORS.primary}; }
    .name .credential { font-size: 13pt; font-weight: 700; color: ${COLORS.accent}; }
    .tagline { font-size: 10.5pt; color: ${COLORS.subtext}; margin-top: 3pt; }
    .contact { font-size: 9.5pt; color: ${COLORS.subtext}; margin-top: 6pt; }
    .contact a { color: ${COLORS.accent}; text-decoration: none; }
    .contact span { margin-right: 16pt; }

    .section-title { font-size: 12pt; font-weight: 800; color: ${COLORS.primary}; margin-top: 10pt; margin-bottom: 4pt; border-bottom: 1.5pt solid ${COLORS.accent}; padding-bottom: 2pt; }

    .summary p { font-size: 9.7pt; line-height: 1.4; margin-bottom: 4pt; }

    .metrics { display: flex; gap: 8pt; margin-top: 7pt; margin-bottom: 7pt; }
    .metric { flex: 1; background: ${COLORS.light}; padding: 7pt 8pt; text-align: center; border-radius: 4pt; }
    .metric-value { font-size: 19pt; font-weight: 800; color: ${COLORS.primary}; line-height: 1.1; }
    .metric-label { font-size: 8.5pt; color: ${COLORS.subtext}; margin-top: 2pt; }

    .skills-table { width: 100%; border-collapse: collapse; font-size: 9.7pt; }
    .skills-table td { padding: 3pt 6pt; vertical-align: top; line-height: 1.35; }
    .skills-table td:first-child { font-weight: 700; color: ${COLORS.primary}; width: 15%; white-space: nowrap; }

    .cert-item { font-size: 10pt; margin-bottom: 4pt; line-height: 1.35; }
    .cert-star { color: ${COLORS.primary}; font-weight: bold; }
    .cert-item a { color: ${COLORS.accent}; text-decoration: none; }

    .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-top: 7pt; margin-bottom: 1.5pt; font-size: 10pt; gap: 6pt; }
    .job-left { font-weight: 700; }
    .job-title { color: ${COLORS.primary}; }
    .job-company { color: ${COLORS.accent}; }
    .job-loc { color: ${COLORS.subtext}; font-weight: 400; }
    .job-dates { font-size: 9.3pt; color: ${COLORS.subtext}; white-space: nowrap; font-style: italic; }
    .job-intro { font-size: 9pt; font-style: italic; color: ${COLORS.subtext}; margin-bottom: 2pt; line-height: 1.3; }

    .bullets { margin-left: 12pt; }
    .bullet { font-size: 9.2pt; line-height: 1.3; margin-bottom: 2pt; padding-left: 10pt; text-indent: -10pt; }
    .bullet::before { content: '\\25B8  '; color: ${COLORS.accent}; font-weight: bold; }

    .earlier-title { font-weight: 700; margin-top: 8pt; margin-bottom: 3pt; font-size: 9.8pt; }
    .earlier-bullets { margin-left: 12pt; }
    .earlier-item { font-size: 9.3pt; line-height: 1.3; margin-bottom: 2pt; padding-left: 10pt; text-indent: -10pt; }
    .earlier-item::before { content: '\\25AA  '; color: ${COLORS.text}; }

    .education { display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 3pt; }
    .edu-right { color: ${COLORS.subtext}; font-style: italic; white-space: nowrap; margin-left: 8pt; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${escapeHtml(c.name)}<span class="credential">, ${escapeHtml(c.credential)}</span></div>
    <div class="tagline">${escapeHtml(c.tagline)}</div>
    <div class="contact">
      <span>&#9993; ${escapeHtml(c.contact.email)}</span>
      <span>&#128279; <a href="https://${c.contact.linkedin}">${escapeHtml(c.contact.linkedin)}</a></span>
      <span>&#8997; <a href="https://${c.contact.github}">${escapeHtml(c.contact.github)}</a></span>
      <span>&#128205; ${escapeHtml(c.contact.location)}</span>
    </div>
  </div>

  <div class="section-title">PROFESSIONAL SUMMARY</div>
  <div class="summary">
${c.summary.map(p => `    <p>${escapeHtml(p)}</p>`).join('\n')}
  </div>

  <div class="metrics">
${metricDivs}
  </div>

  <div class="section-title">CORE TECHNICAL COMPETENCIES</div>
  <table class="skills-table">
${competencyRows}
  </table>

  <div class="section-title">CERTIFICATIONS</div>
  <div class="cert-item"><span class="cert-star">&#9733;</span> <strong>${escapeHtml(c.certifications.primary)}</strong> ${escapeHtml(c.certifications.primaryMeta)} · <a href="https://${c.certifications.credlyUrl}">${escapeHtml(c.certifications.credlyUrl)}</a></div>
  <div class="cert-item">${escapeHtml(c.certifications.previous)}</div>

  <div class="section-title">PROFESSIONAL EXPERIENCE</div>

${experienceHtml}

  <div class="earlier-title">Earlier Career</div>
  <div class="earlier-bullets">
${earlierHtml}
  </div>

  <div class="section-title">EDUCATION</div>
${educationHtml}
</body>
</html>
`;
}

// ── docx renderer ────────────────────────────────────────────────────────────
const noBorder  = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function docxRule(color = DOCX_COLORS.accent, size = 10) {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size, color, space: 1 } },
    children: [],
  });
}

function docxSectionHeading(text) {
  return [
    new Paragraph({
      spacing: { before: 220, after: 0 },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: DOCX_COLORS.primary, font: 'Arial' })],
    }),
    docxRule(),
  ];
}

function docxBullet(text) {
  const { label, rest } = splitBoldLabel(text);
  const children = label
    ? [
        new TextRun({ text: label, bold: true, size: 18, color: DOCX_COLORS.text, font: 'Arial' }),
        new TextRun({ text: rest, size: 18, color: DOCX_COLORS.text, font: 'Arial' }),
      ]
    : [new TextRun({ text: rest, size: 18, color: DOCX_COLORS.text, font: 'Arial' })];

  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 40, line: 280 },
    children,
  });
}

function docxJobHeader(title, company, location, dates) {
  return new Paragraph({
    spacing: { before: 200, after: 50 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
    children: [
      new TextRun({ text: title, bold: true, size: 20, color: DOCX_COLORS.primary, font: 'Arial' }),
      new TextRun({ text: '  ·  ', size: 18, color: DOCX_COLORS.subtext, font: 'Arial' }),
      new TextRun({ text: company, bold: true, size: 19, color: DOCX_COLORS.accent, font: 'Arial' }),
      new TextRun({ text: '  ·  ' + location, size: 17, color: DOCX_COLORS.subtext, font: 'Arial' }),
      new TextRun({ text: '\t', size: 17, font: 'Arial' }),
      new TextRun({ text: dates, italics: true, size: 17, color: DOCX_COLORS.subtext, font: 'Arial' }),
    ],
  });
}

function docxSkillRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorders,
        width: { size: 2100, type: WidthType.DXA },
        margins: { top: 55, bottom: 55, left: 0, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: DOCX_COLORS.primary, font: 'Arial' })] })],
      }),
      new TableCell({
        borders: noBorders,
        width: { size: 7260, type: WidthType.DXA },
        margins: { top: 55, bottom: 55, left: 0, right: 0 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 18, color: DOCX_COLORS.text, font: 'Arial' })] })],
      }),
    ],
  });
}

function docxMetricCell(metric, label) {
  return new TableCell({
    borders: noBorders,
    shading: { fill: DOCX_COLORS.light, type: ShadingType.CLEAR },
    width: { size: 3120, type: WidthType.DXA },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: metric, bold: true, size: 34, color: DOCX_COLORS.primary, font: 'Arial' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20 }, children: [new TextRun({ text: label, size: 16, color: DOCX_COLORS.subtext, font: 'Arial' })] }),
    ],
  });
}

function docxPara(text, { before = 60, after = 60, size = 18, color, bold = false, italics = false } = {}) {
  return new Paragraph({
    spacing: { before, after, line: 280 },
    children: [new TextRun({ text, size, color: color || DOCX_COLORS.text, font: 'Arial', bold, italics })],
  });
}

function docxEducationRow(degree, school, year) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
    children: [
      new TextRun({ text: degree, bold: true, size: 18, color: DOCX_COLORS.primary, font: 'Arial' }),
      new TextRun({ text: '  ·  ' + school, size: 18, color: DOCX_COLORS.text, font: 'Arial' }),
      new TextRun({ text: '\t', size: 18, font: 'Arial' }),
      new TextRun({ text: year, italics: true, size: 17, color: DOCX_COLORS.subtext, font: 'Arial' }),
    ],
  });
}

function buildDocx(c) {
  const experienceChildren = c.experience.flatMap(job => [
    docxJobHeader(job.title, job.company, job.location, job.dates),
    ...(job.intro ? [docxPara(job.intro, { before: 20, after: 70, italics: true, color: DOCX_COLORS.subtext, size: 17 })] : []),
    ...job.bullets.map(docxBullet),
  ]);

  return new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '▸', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 280 } } } }],
      }],
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 18, color: DOCX_COLORS.text } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 936, bottom: 720, left: 936 },
        },
      },
      children: [
        new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: c.name, bold: true, size: 52, color: DOCX_COLORS.primary, font: 'Arial' }),
            new TextRun({ text: ', ' + c.credential, size: 26, color: DOCX_COLORS.accent, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 50, after: 70 },
          children: [new TextRun({ text: c.tagline, size: 21, color: DOCX_COLORS.subtext, font: 'Arial' })],
        }),
        docxRule(DOCX_COLORS.primary, 14),
        new Paragraph({
          spacing: { before: 70, after: 100 },
          tabStops: [
            { type: TabStopType.LEFT, position: 3100 },
            { type: TabStopType.LEFT, position: 6000 },
            { type: TabStopType.LEFT, position: 8300 },
          ],
          children: [
            new TextRun({ text: `✉  ${c.contact.email}`, size: 19, color: DOCX_COLORS.subtext, font: 'Arial' }),
            new TextRun({ text: `\t🔗  ${c.contact.linkedin}`, size: 19, color: DOCX_COLORS.accent, font: 'Arial' }),
            new TextRun({ text: `\t⌥  ${c.contact.github}`, size: 19, color: DOCX_COLORS.accent, font: 'Arial' }),
            new TextRun({ text: `\t📍  ${c.contact.location}`, size: 19, color: DOCX_COLORS.subtext, font: 'Arial' }),
          ],
        }),

        ...docxSectionHeading('Professional Summary'),
        docxPara(c.summary[0], { before: 80, after: 60 }),
        docxPara(c.summary[1], { before: 40, after: 60 }),
        docxPara(c.summary[2], { before: 40, after: 100 }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: c.metrics.map(() => Math.floor(9360 / c.metrics.length)),
          rows: [new TableRow({ children: c.metrics.map(m => docxMetricCell(m.value, m.label)) })],
        }),

        ...docxSectionHeading('Core Technical Competencies'),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2100, 7260],
          rows: c.competencies.map(({ label, value }) => docxSkillRow(label, value)),
        }),

        ...docxSectionHeading('Certifications'),
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: `★  ${c.certifications.primary}`, bold: true, size: 18, color: DOCX_COLORS.primary, font: 'Arial' }),
            new TextRun({ text: `  ${c.certifications.primaryMeta}  ·  ${c.certifications.credlyUrl}`, size: 17, color: DOCX_COLORS.subtext, font: 'Arial' }),
          ],
        }),
        docxPara(c.certifications.previous, { size: 17, color: DOCX_COLORS.subtext, before: 20, after: 80 }),

        ...docxSectionHeading('Professional Experience'),
        ...experienceChildren,

        new Paragraph({
          spacing: { before: 180, after: 40 },
          children: [new TextRun({ text: 'Earlier Career', bold: true, size: 19, color: DOCX_COLORS.primary, font: 'Arial' })],
        }),
        ...c.earlierCareer.map((item, i) =>
          docxPara(item, { size: 17, color: DOCX_COLORS.subtext, before: i === 0 ? 30 : 20, after: i === c.earlierCareer.length - 1 ? 80 : 20 })
        ),

        ...docxSectionHeading('Education'),
        ...c.education.map(({ degree, school, year }) => docxEducationRow(degree, school, year)),
      ],
    }],
  });
}

async function generatePDF(html) {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({
      path: 'Rajesh_Sood_Resume_2026.pdf',
      format: 'letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.65in', right: '0.65in' },
    });
  } finally {
    await browser.close();
  }
}

async function generateDocx() {
  const doc = buildDocx(CONTENT);
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('Rajesh_Sood_Resume_2026.docx', buf);
}

async function main() {
  const html = buildHtml(CONTENT);
  fs.writeFileSync('resume.html', html);
  await generatePDF(html);
  await generateDocx();
  console.log('Done');
}

main().catch(console.error);
