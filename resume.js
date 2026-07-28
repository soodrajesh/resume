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

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rajesh Sood Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.4; color: ${COLORS.text}; }

    .header { border-bottom: 2.5pt solid ${COLORS.primary}; padding-bottom: 8pt; margin-bottom: 10pt; }
    .name { font-size: 26pt; font-weight: 800; color: ${COLORS.primary}; }
    .name .mba { font-size: 13pt; font-weight: 700; color: ${COLORS.accent}; }
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
    <div class="name">RAJESH SOOD<span class="mba">, MBA</span></div>
    <div class="tagline">Senior Cloud & DevOps Engineer · AI/ML Platform Engineering · AWS · Kubernetes · Terraform · SRE</div>
    <div class="contact">
      <span>&#9993; soodrajesh87@gmail.com</span>
      <span>&#128279; <a href="https://linkedin.com/in/rajeshsood">linkedin.com/in/rajeshsood</a></span>
      <span>&#8997; <a href="https://github.com/soodrajesh">github.com/soodrajesh</a></span>
      <span>&#128205; Dublin, Ireland</span>
    </div>
  </div>

  <div class="section-title">PROFESSIONAL SUMMARY</div>
  <div class="summary">
    <p>With over 15 years of enterprise cloud experience, I architect the platforms that engineering teams rely on to ship fast, stay resilient, and scale without surprises.</p>
    <p>I lead DevOps and AI/ML platform engineering across multi-account AWS — building the infrastructure that powers internal AI products, documentation platforms, and GenAI integrations at enterprise scale. Alongside that, I set reliability standards across critical AWS workloads, own incident response frameworks, and drive FinOps governance that has compounded to $200K+ in cloud cost savings.</p>
    <p>Technical depth spans cloud architecture, Kubernetes, Terraform, SRE, and AI-augmented engineering — using Claude, Bedrock, and GitHub Copilot as everyday tools for IaC generation, log analysis, and automated remediation workflows.</p>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-value">$200K+</div>
      <div class="metric-label">Cloud Cost Savings</div>
    </div>
    <div class="metric">
      <div class="metric-value">99.99%</div>
      <div class="metric-label">Uptime SLA Delivered</div>
    </div>
    <div class="metric">
      <div class="metric-value">35%</div>
      <div class="metric-label">Faster Deploy Cycles</div>
    </div>
  </div>

  <div class="section-title">CORE TECHNICAL COMPETENCIES</div>
  <table class="skills-table">
    <tr><td>AI/ML Platform:</td><td>AWS SageMaker, AWS Bedrock, RAG Pipeline Design, LLM Integration (Claude, Titan), GenAI Ops</td></tr>
    <tr><td>Cloud Architecture:</td><td>AWS (EKS, Networking, Serverless) · Azure · GCP · OCI — multi-region, multi-account</td></tr>
    <tr><td>Platform Eng & IaC:</td><td>Terraform, CloudFormation, Helm, Ansible — Internal developer platforms · Self-service infra</td></tr>
    <tr><td>SRE & Reliability:</td><td>SLO/SLI/Error-budget design · Incident command · Splunk, Datadog, Prometheus/Grafana</td></tr>
    <tr><td>CI/CD & DevOps:</td><td>Jenkins, GitHub Actions · Shift-left testing · 35% cycle-time reduction achieved</td></tr>
    <tr><td>Security/Compliance:</td><td>DevSecOps (Wiz, Snyk, SonarQube) · IAM zero-trust design · GDPR, SOC 2, HIPAA · Automated remediation pipelines</td></tr>
    <tr><td>AI-Augmented Eng:</td><td>GitHub Copilot, Cursor, Claude/Bedrock — IaC generation, log analysis, vulnerability auto-remediation workflows</td></tr>
  </table>

  <div class="section-title">CERTIFICATIONS</div>
  <div class="cert-item"><span class="cert-star">&#9733;</span> <strong>AWS Certified Solutions Architect – Professional</strong> (Valid Dec 2026) · <a href="https://credly.com/users/rajeshsood">credly.com/users/rajeshsood</a></div>
  <div class="cert-item">Previously Certified: Microsoft Azure (Exam 533) · Google Cloud Professional Architect · Oracle OCI Architect Professional & Associate</div>

  <div class="section-title">PROFESSIONAL EXPERIENCE</div>

  <div class="job-header">
    <span class="job-left"><span class="job-title">Senior DevOps Engineer</span> · <span class="job-company">Workday</span> · <span class="job-loc">Dublin, Ireland</span></span>
    <span class="job-dates">Oct 2023 – Present</span>
  </div>
  <div class="job-intro">Leading DevOps and AI/ML platform engineering within Workday's enterprise AWS environment, enabling internal product and documentation teams.</div>
  <div class="bullets">
    <div class="bullet"><strong>AI/ML Platform Architecture:</strong> Designed and deployed SageMaker infrastructure enabling internal AI/ML teams to build, version, and serve models against Workday's documentation data — reducing model deployment lead time by 40%.</div>
    <div class="bullet"><strong>Generative AI Integration:</strong> Engineered serverless RAG pipelines and GenAI workflows via AWS Bedrock (Claude, Titan) powering internal AI chatbots and documentation search applications — spanning prompt engineering, vector search, and production observability.</div>
    <div class="bullet"><strong>SRE & Reliability:</strong> Owned SLO/SLI framework and incident response for critical EKS microservices, maintaining 99.99% uptime through capacity planning and structured on-call rotation.</div>
    <div class="bullet"><strong>Platform Modernisation:</strong> Redesigned CI/CD workflows (Jenkins + GitHub Actions) and IaC standards (Terraform/Helm), delivering a 35% reduction in deployment cycle time across all squads.</div>
    <div class="bullet"><strong>Security Automation:</strong> Built AI-powered vulnerability remediation pipelines using Claude/Bedrock to auto-analyse PRs & Wiz findings and generate validated Terraform fixes — cutting mean remediation time by 60%.</div>
    <div class="bullet"><strong>FinOps Governance:</strong> Implemented cloud cost standards across multi-account AWS, driving $100K+ in cumulative savings through rightsizing, RI strategy, and anomaly detection automation.</div>
    <div class="bullet"><strong>AI-Augmented Velocity:</strong> Drove 25% acceleration in IaC delivery through team-wide adoption of GitHub Copilot and Cursor tooling.</div>
  </div>

  <div class="job-header">
    <span class="job-left"><span class="job-title">Cloud Infrastructure Engineer (SRE)</span> · <span class="job-company">Protego Technologies</span> · <span class="job-loc">Dublin, Ireland</span></span>
    <span class="job-dates">Sep 2022 – Oct 2023</span>
  </div>
  <div class="bullets">
    <div class="bullet"><strong>Observability Architecture:</strong> Built global observability stack (Splunk + Datadog + Prometheus) with SLO/SLI alerting, reducing MTTR by 45% across high-availability financial services workloads.</div>
    <div class="bullet"><strong>Security Posture:</strong> Integrated Snyk and OWASP ZAP into automated pipelines as shift-left controls, reducing production vulnerabilities by 40%.</div>
    <div class="bullet"><strong>Reliability Engineering:</strong> Owned EKS cluster operations for HA financial services — capacity planning, incident command, and runbook-driven on-call rotation.</div>
  </div>

  <div class="job-header">
    <span class="job-left"><span class="job-title">Cloud SysOps Engineer (Lead)</span> · <span class="job-company">Hilti Asia IT Services</span> · <span class="job-loc">Kuala Lumpur, Malaysia</span></span>
    <span class="job-dates">Dec 2019 – Aug 2022</span>
  </div>
  <div class="bullets">
    <div class="bullet"><strong>Cost Optimisation:</strong> Delivered $120K in annual savings through Reserved Instance strategy and resource lifecycle automation across multi-region AWS.</div>
    <div class="bullet"><strong>Global Standardisation:</strong> Authored CloudFormation templates enforcing security and compliance baselines across 10+ AWS regions and business units.</div>
    <div class="bullet"><strong>Compliance Leadership:</strong> Led IAM governance program ensuring controls met enterprise SOC 2 and internal audit standards.</div>
  </div>

  <div class="job-header">
    <span class="job-left"><span class="job-title">Cloud Service Engineer</span> · <span class="job-company">MAXIS Sdn Bhd</span> · <span class="job-loc">Kuala Lumpur, Malaysia</span></span>
    <span class="job-dates">Jul 2018 – Dec 2019</span>
  </div>
  <div class="bullets">
    <div class="bullet"><strong>Scale Migration:</strong> Architected and migrated 30+ enterprise applications to AWS with HA/DR configurations and zero-downtime cutovers.</div>
    <div class="bullet"><strong>RI Strategy:</strong> Spearheaded Reserved Instance purchasing program, reducing cloud expenditure by 15% ($80K annually).</div>
  </div>

  <div class="job-header">
    <span class="job-left"><span class="job-title">IT Service Delivery Consultant III (L3)</span> · <span class="job-company">DXC Technology (formerly HPE)</span> · <span class="job-loc">Cyberjaya, Malaysia</span></span>
    <span class="job-dates">Feb 2017 – Jun 2018</span>
  </div>
  <div class="bullets">
    <div class="bullet"><strong>Multi-Cloud Operations:</strong> Provided L3 architectural support across hybrid environments (AWS, Hyper-V, VMware), managing 300+ EC2 instances across 8 enterprise accounts.</div>
    <div class="bullet"><strong>Automation:</strong> Developed health-check and remediation scripts that significantly reduced application downtime and manual escalation.</div>
  </div>

  <div class="earlier-title">Earlier Career</div>
  <div class="earlier-bullets">
    <div class="earlier-item">Senior VMware Administrator (L3) · Softenger Malaysia (HPE client) · Oct 2016 – Jan 2017</div>
    <div class="earlier-item">Senior IT OS Analyst · Optum / UnitedHealth Group, Noida · Nov 2014 – Oct 2016 — IaaS automation with HP BSA Suite; vSphere and vRealize Automation for self-service provisioning.</div>
    <div class="earlier-item">Associate Professional · CSC India (now DXC) · Oct 2012 – Nov 2014 — Windows/Linux environments and VMware vSphere administration.</div>
    <div class="earlier-item">Dell International & HCL India · Jul 2010 – Oct 2012 — Enterprise technical support, Active Directory, and network device administration.</div>
  </div>

  <div class="section-title">EDUCATION</div>
  <div class="education">
    <span><strong>MBA in Information Technology</strong> · Sikkim Manipal University, India</span>
    <span class="edu-right">2015</span>
  </div>
  <div class="education">
    <span><strong>B.E. in Computer Science</strong> · Visvesvaraya Technological University, Karnataka, India</span>
    <span class="edu-right">2010</span>
  </div>
</body>
</html>
`;

// ── docx helpers ─────────────────────────────────────────────────────────────
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
  const colonIdx = text.indexOf(':');
  const children = (colonIdx > -1 && colonIdx < 55)
    ? [
        new TextRun({ text: text.substring(0, colonIdx + 1), bold: true, size: 18, color: DOCX_COLORS.text, font: 'Arial' }),
        new TextRun({ text: text.substring(colonIdx + 1), size: 18, color: DOCX_COLORS.text, font: 'Arial' }),
      ]
    : [new TextRun({ text, size: 18, color: DOCX_COLORS.text, font: 'Arial' })];

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

async function generateDocx() {
  const doc = new Document({
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
            new TextRun({ text: 'RAJESH SOOD', bold: true, size: 52, color: DOCX_COLORS.primary, font: 'Arial' }),
            new TextRun({ text: ', MBA', size: 26, color: DOCX_COLORS.accent, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 50, after: 70 },
          children: [new TextRun({
            text: 'Senior Cloud & DevOps Engineer · AI/ML Platform Engineering · AWS · Kubernetes · Terraform · SRE',
            size: 21, color: DOCX_COLORS.subtext, font: 'Arial',
          })],
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
            new TextRun({ text: '✉  soodrajesh87@gmail.com', size: 19, color: DOCX_COLORS.subtext, font: 'Arial' }),
            new TextRun({ text: '\t🔗  linkedin.com/in/rajeshsood', size: 19, color: DOCX_COLORS.accent, font: 'Arial' }),
            new TextRun({ text: '\t⌥  github.com/soodrajesh', size: 19, color: DOCX_COLORS.accent, font: 'Arial' }),
            new TextRun({ text: '\t📍  Dublin, Ireland', size: 19, color: DOCX_COLORS.subtext, font: 'Arial' }),
          ],
        }),

        ...docxSectionHeading('Professional Summary'),
        docxPara(
          'With over 15 years of enterprise cloud experience, I architect the platforms that engineering teams rely on to ship fast, stay resilient, and scale without surprises.',
          { before: 80, after: 60 }
        ),
        docxPara(
          'I lead DevOps and AI/ML platform engineering across multi-account AWS — building the infrastructure that powers internal AI products, documentation platforms, and GenAI integrations at enterprise scale. Alongside that, I set reliability standards across critical AWS workloads, own incident response frameworks, and drive FinOps governance that has compounded to $200K+ in cloud cost savings.',
          { before: 40, after: 60 }
        ),
        docxPara(
          'Technical depth spans cloud architecture, Kubernetes, Terraform, SRE, and AI-augmented engineering — using Claude, Bedrock, and GitHub Copilot as everyday tools for IaC generation, log analysis, and automated remediation workflows.',
          { before: 40, after: 100 }
        ),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [new TableRow({ children: [
            docxMetricCell('$200K+', 'Cloud Cost Savings'),
            docxMetricCell('99.99%', 'Uptime SLA Delivered'),
            docxMetricCell('35%',    'Faster Deploy Cycles'),
          ]})],
        }),

        ...docxSectionHeading('Core Technical Competencies'),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2100, 7260],
          rows: [
            docxSkillRow('AI/ML Platform:', 'AWS SageMaker, AWS Bedrock, RAG Pipeline Design, LLM Integration (Claude, Titan), GenAI Ops'),
            docxSkillRow('Cloud Architecture:', 'AWS (EKS, Networking, Serverless) · Azure · GCP · OCI — multi-region, multi-account'),
            docxSkillRow('Platform Eng & IaC:', 'Terraform, CloudFormation, Helm, Ansible — Internal developer platforms · Self-service infra'),
            docxSkillRow('SRE & Reliability:', 'SLO/SLI/Error-budget design · Incident command · Splunk, Datadog, Prometheus/Grafana'),
            docxSkillRow('CI/CD & DevOps:', 'Jenkins, GitHub Actions · Shift-left testing · 35% cycle-time reduction achieved'),
            docxSkillRow('Security/Compliance:', 'DevSecOps (Wiz, Snyk, SonarQube) · IAM zero-trust design · GDPR, SOC 2, HIPAA · Automated remediation pipelines'),
            docxSkillRow('AI-Augmented Eng:', 'GitHub Copilot, Cursor, Claude/Bedrock — IaC generation, log analysis, vulnerability auto-remediation workflows'),
          ],
        }),

        ...docxSectionHeading('Certifications'),
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: '★  AWS Certified Solutions Architect – Professional', bold: true, size: 18, color: DOCX_COLORS.primary, font: 'Arial' }),
            new TextRun({ text: '  (Valid Dec 2026)  ·  credly.com/users/rajeshsood', size: 17, color: DOCX_COLORS.subtext, font: 'Arial' }),
          ],
        }),
        docxPara(
          'Previously Certified: Microsoft Azure (Exam 533) · Google Cloud Professional Architect · Oracle OCI Architect Professional & Associate',
          { size: 17, color: DOCX_COLORS.subtext, before: 20, after: 80 }
        ),

        ...docxSectionHeading('Professional Experience'),

        docxJobHeader('Senior DevOps Engineer', 'Workday', 'Dublin, Ireland', 'Oct 2023 – Present'),
        docxPara(
          "Leading DevOps and AI/ML platform engineering within Workday's enterprise AWS environment, enabling internal product and documentation teams.",
          { before: 20, after: 70, italics: true, color: DOCX_COLORS.subtext, size: 17 }
        ),
        docxBullet("AI/ML Platform Architecture: Designed and deployed SageMaker infrastructure enabling internal AI/ML teams to build, version, and serve models against Workday's documentation data — reducing model deployment lead time by 40%."),
        docxBullet('Generative AI Integration: Engineered serverless RAG pipelines and GenAI workflows via AWS Bedrock (Claude, Titan) powering internal AI chatbots and documentation search applications — spanning prompt engineering, vector search, and production observability.'),
        docxBullet('SRE & Reliability: Owned SLO/SLI framework and incident response for critical EKS microservices, maintaining 99.99% uptime through capacity planning and structured on-call rotation.'),
        docxBullet('Platform Modernisation: Redesigned CI/CD workflows (Jenkins + GitHub Actions) and IaC standards (Terraform/Helm), delivering a 35% reduction in deployment cycle time across all squads.'),
        docxBullet('Security Automation: Built AI-powered vulnerability remediation pipelines using Claude/Bedrock to auto-analyse PRs & Wiz findings and generate validated Terraform fixes — cutting mean remediation time by 60%.'),
        docxBullet('FinOps Governance: Implemented cloud cost standards across multi-account AWS, driving $100K+ in cumulative savings through rightsizing, RI strategy, and anomaly detection automation.'),
        docxBullet('AI-Augmented Velocity: Drove 25% acceleration in IaC delivery through team-wide adoption of GitHub Copilot and Cursor tooling.'),

        docxJobHeader('Cloud Infrastructure Engineer (SRE)', 'Protego Technologies', 'Dublin, Ireland', 'Sep 2022 – Oct 2023'),
        docxBullet('Observability Architecture: Built global observability stack (Splunk + Datadog + Prometheus) with SLO/SLI alerting, reducing MTTR by 45% across high-availability financial services workloads.'),
        docxBullet('Security Posture: Integrated Snyk and OWASP ZAP into automated pipelines as shift-left controls, reducing production vulnerabilities by 40%.'),
        docxBullet('Reliability Engineering: Owned EKS cluster operations for HA financial services — capacity planning, incident command, and runbook-driven on-call rotation.'),

        docxJobHeader('Cloud SysOps Engineer (Lead)', 'Hilti Asia IT Services', 'Kuala Lumpur, Malaysia', 'Dec 2019 – Aug 2022'),
        docxBullet('Cost Optimisation: Delivered $120K in annual savings through Reserved Instance strategy and resource lifecycle automation across multi-region AWS.'),
        docxBullet('Global Standardisation: Authored CloudFormation templates enforcing security and compliance baselines across 10+ AWS regions and business units.'),
        docxBullet('Compliance Leadership: Led IAM governance program ensuring controls met enterprise SOC 2 and internal audit standards.'),

        docxJobHeader('Cloud Service Engineer', 'MAXIS Sdn Bhd', 'Kuala Lumpur, Malaysia', 'Jul 2018 – Dec 2019'),
        docxBullet('Scale Migration: Architected and migrated 30+ enterprise applications to AWS with HA/DR configurations and zero-downtime cutovers.'),
        docxBullet('RI Strategy: Spearheaded Reserved Instance purchasing program, reducing cloud expenditure by 15% ($80K annually).'),

        docxJobHeader('IT Service Delivery Consultant III (L3)', 'DXC Technology (formerly HPE)', 'Cyberjaya, Malaysia', 'Feb 2017 – Jun 2018'),
        docxBullet('Multi-Cloud Operations: Provided L3 architectural support across hybrid environments (AWS, Hyper-V, VMware), managing 300+ EC2 instances across 8 enterprise accounts.'),
        docxBullet('Automation: Developed health-check and remediation scripts that significantly reduced application downtime and manual escalation.'),

        new Paragraph({
          spacing: { before: 180, after: 40 },
          children: [new TextRun({ text: 'Earlier Career', bold: true, size: 19, color: DOCX_COLORS.primary, font: 'Arial' })],
        }),
        docxPara('Senior VMware Administrator (L3) · Softenger Malaysia (HPE client) · Oct 2016 – Jan 2017', { size: 17, color: DOCX_COLORS.subtext, before: 30, after: 20 }),
        docxPara('Senior IT OS Analyst · Optum / UnitedHealth Group, Noida · Nov 2014 – Oct 2016 — IaaS automation with HP BSA Suite; vSphere and vRealize Automation for self-service provisioning.', { size: 17, color: DOCX_COLORS.subtext, before: 20, after: 20 }),
        docxPara('Associate Professional · CSC India (now DXC) · Oct 2012 – Nov 2014 — Windows/Linux environments and VMware vSphere administration.', { size: 17, color: DOCX_COLORS.subtext, before: 20, after: 20 }),
        docxPara('Dell International & HCL India · Jul 2010 – Oct 2012 — Enterprise technical support, Active Directory, and network device administration.', { size: 17, color: DOCX_COLORS.subtext, before: 20, after: 80 }),

        ...docxSectionHeading('Education'),
        docxEducationRow('MBA in Information Technology', 'Sikkim Manipal University, India', '2015'),
        docxEducationRow('B.E. in Computer Science', 'Visvesvaraya Technological University, Karnataka, India', '2010'),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync('Rajesh_Sood_Resume_2026.docx', buf);
}

async function generatePDF() {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(htmlTemplate);
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

async function main() {
  fs.writeFileSync('resume.html', htmlTemplate);
  await generatePDF();
  await generateDocx();
  console.log('Done');
}

main().catch(console.error);
