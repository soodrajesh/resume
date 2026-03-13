const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, BorderStyle, WidthType, ShadingType,
  VerticalAlign, TabStopType,
} = require('docx');
const fs = require('fs');

const COLORS = {
  primary:  '1B3A6B',
  accent:   '2E75B6',
  light:    'D6E4F0',
  text:     '1A1A1A',
  subtext:  '555555',
};

const noBorder  = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function rule(color = COLORS.accent, size = 10) {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size, color, space: 1 } },
    children: [],
  });
}

function sectionHeading(text) {
  return [
    new Paragraph({
      spacing: { before: 220, after: 0 },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: COLORS.primary, font: 'Arial' })],
    }),
    rule(),
  ];
}

function bullet(text) {
  const colonIdx = text.indexOf(':');
  const children = (colonIdx > -1 && colonIdx < 55)
    ? [
        new TextRun({ text: text.substring(0, colonIdx + 1), bold: true, size: 19, color: COLORS.text, font: 'Arial' }),
        new TextRun({ text: text.substring(colonIdx + 1), size: 19, color: COLORS.text, font: 'Arial' }),
      ]
    : [new TextRun({ text, size: 19, color: COLORS.text, font: 'Arial' })];

  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 40 },
    children,
  });
}

function jobHeader(title, company, location, dates) {
  return new Paragraph({
    spacing: { before: 200, after: 50 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
    children: [
      new TextRun({ text: title, bold: true, size: 21, color: COLORS.primary, font: 'Arial' }),
      new TextRun({ text: '  ·  ', size: 19, color: COLORS.subtext, font: 'Arial' }),
      new TextRun({ text: company, bold: true, size: 20, color: COLORS.accent, font: 'Arial' }),
      new TextRun({ text: '  ·  ' + location, size: 18, color: COLORS.subtext, font: 'Arial' }),
      new TextRun({ text: '\t', size: 18, font: 'Arial' }),
      new TextRun({ text: dates, italics: true, size: 18, color: COLORS.subtext, font: 'Arial' }),
    ],
  });
}

function skillRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorders,
        width: { size: 2100, type: WidthType.DXA },
        margins: { top: 55, bottom: 55, left: 0, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 19, color: COLORS.primary, font: 'Arial' })] })],
      }),
      new TableCell({
        borders: noBorders,
        width: { size: 7260, type: WidthType.DXA },
        margins: { top: 55, bottom: 55, left: 0, right: 0 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 19, color: COLORS.text, font: 'Arial' })] })],
      }),
    ],
  });
}

function metricCell(metric, label) {
  return new TableCell({
    borders: noBorders,
    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
    width: { size: 2340, type: WidthType.DXA },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: metric, bold: true, size: 32, color: COLORS.primary, font: 'Arial' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20 }, children: [new TextRun({ text: label, size: 16, color: COLORS.subtext, font: 'Arial' })] }),
    ],
  });
}

function para(text, { before = 60, after = 60, size = 19, color, bold = false, italics = false } = {}) {
  return new Paragraph({
    spacing: { before, after },
    children: [new TextRun({ text, size, color: color || COLORS.text, font: 'Arial', bold, italics })],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '▸', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 280 } } } }],
    }],
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 19, color: COLORS.text } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 864, right: 1080, bottom: 864, left: 1080 },
      },
    },
    children: [

      // NAME
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: 'RAJESH SOOD', bold: true, size: 58, color: COLORS.primary, font: 'Arial' }),
          new TextRun({ text: ', MBA', size: 30, color: COLORS.accent, font: 'Arial' }),
        ],
      }),

      // TAGLINE — dual target
      new Paragraph({
        spacing: { before: 50, after: 70 },
        children: [new TextRun({
          text: 'Senior Cloud & DevOps Engineer  ·  AI/ML Platform Engineering  ·  AWS · Kubernetes · Terraform · SRE  ·  Dublin, Ireland',
          size: 20, color: COLORS.subtext, font: 'Arial',
        })],
      }),

      rule(COLORS.primary, 14),

      // CONTACT
      new Paragraph({
        spacing: { before: 70, after: 100 },
        tabStops: [
          { type: TabStopType.LEFT, position: 3100 },
          { type: TabStopType.LEFT, position: 6000 },
          { type: TabStopType.LEFT, position: 8300 },
        ],
        children: [
          new TextRun({ text: '✉  soodrajesh87@gmail.com', size: 18, color: COLORS.subtext, font: 'Arial' }),
          new TextRun({ text: '\t🔗  linkedin.com/in/rajeshsood', size: 18, color: COLORS.accent, font: 'Arial' }),
          new TextRun({ text: '\t⌥  github.com/rajeshsood', size: 18, color: COLORS.accent, font: 'Arial' }),
          new TextRun({ text: '\t📍  Dublin, Ireland', size: 18, color: COLORS.subtext, font: 'Arial' }),
        ],
      }),

      // SUMMARY
      ...sectionHeading('Professional Summary'),

      para(
        'With over 15 years of enterprise cloud experience, I architect the platforms that engineering teams rely on to ship fast, stay resilient, and scale without surprises.',
        { before: 80, after: 60 }
      ),
      para(
        'At Workday, I lead DevOps and AI/ML platform engineering across multi-account AWS: designing SageMaker orchestration systems, building serverless RAG pipelines, and deploying production GenAI integrations via AWS Bedrock. Alongside that, I set reliability standards across critical EKS workloads, own incident response frameworks, and drive FinOps governance that has compounded to $400K+ in cloud cost savings.',
        { before: 40, after: 60 }
      ),
      para(
        'Technical depth spans cloud architecture, Kubernetes, Terraform, SRE, and AI-augmented engineering — using Claude, Bedrock, and GitHub Copilot as everyday tools for IaC generation, log analysis, and automated remediation workflows.',
        { before: 40, after: 100 }
      ),

      // IMPACT METRICS
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [new TableRow({ children: [
          metricCell('$400K+',  'Cloud Cost Savings'),
          metricCell('99.99%',  'Uptime SLA Delivered'),
          metricCell('35%',     'Faster Deploy Cycles'),
          metricCell('10+',     'Engineering Squads Led'),
        ]})],
      }),

      // COMPETENCIES
      ...sectionHeading('Core Technical Competencies'),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2100, 7260],
        rows: [
          skillRow('AI/ML Platform:',     'AWS SageMaker, AWS Bedrock, RAG Pipeline Design, LLM Integration (Claude, Titan), GenAI Ops'),
          skillRow('Cloud Architecture:', 'AWS (EKS, Advanced Networking, Serverless, Lambda) · Azure · GCP · OCI — multi-region, multi-account'),
          skillRow('Platform Eng & IaC:', 'Terraform, CloudFormation, Helm, Ansible — GitOps-first delivery · Internal developer platforms · Self-service infra'),
          skillRow('SRE & Reliability:',  'SLO/SLI/Error-budget design · Incident command · Chaos engineering · Splunk, Datadog, Prometheus/Grafana'),
          skillRow('CI/CD & DevOps:',     'Jenkins, GitHub Actions, ArgoCD · Trunk-based delivery · Shift-left testing · 35% cycle-time reduction achieved'),
          skillRow('Security & Compl.:',  'DevSecOps (Wiz, Snyk, SonarQube) · IAM zero-trust design · GDPR, SOC 2, HIPAA · Automated remediation pipelines'),
          skillRow('AI-Augmented Eng:',   'GitHub Copilot, Cursor, Claude/Bedrock — IaC generation, log analysis, vulnerability auto-remediation workflows'),
        ],
      }),

      // CERTIFICATIONS
      ...sectionHeading('Certifications'),

      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({ text: '★  AWS Certified Solutions Architect – Professional', bold: true, size: 19, color: COLORS.primary, font: 'Arial' }),
          new TextRun({ text: '  (Valid Dec 2026)  ·  credly.com/users/rajeshsood', size: 18, color: COLORS.subtext, font: 'Arial' }),
        ],
      }),
      para(
        'Previously Certified: Microsoft Azure (Exam 533)  ·  Google Cloud Professional Architect  ·  Oracle OCI Architect Professional & Associate',
        { size: 18, color: COLORS.subtext, before: 20, after: 80 }
      ),

      // EXPERIENCE
      ...sectionHeading('Professional Experience'),

      // ── WORKDAY
      jobHeader('Senior DevOps Engineer', 'Workday', 'Dublin, Ireland', 'Oct 2023 – Present'),
      para(
        'Leading DevOps and AI/ML platform engineering across 10+ engineering squads in a globally distributed, high-scale SaaS environment.',
        { before: 20, after: 70, italics: true, color: COLORS.subtext, size: 18 }
      ),
      bullet('AI/ML Platform Architecture: Designed and deployed scalable SageMaker infrastructure enabling data science teams to version, train, and serve models at enterprise scale — reducing model deployment lead time by 40%.'),
      bullet('Generative AI Integration: Engineered serverless RAG pipelines and GenAI workflows via AWS Bedrock (Claude, Titan) for internal enterprise applications, spanning prompt engineering, vector search, and production observability.'),
      bullet('SRE & Reliability: Owned SLO/SLI framework and incident response for critical EKS microservices, maintaining 99.99% uptime through chaos-informed capacity planning and structured on-call rotation.'),
      bullet('Platform Modernisation: Redesigned CI/CD workflows (Jenkins + GitHub Actions) and IaC standards (Terraform/Helm), delivering a 35% reduction in deployment cycle time across all squads.'),
      bullet('Security Automation: Built AI-powered vulnerability remediation pipelines using Claude/Bedrock to auto-analyse Wiz findings and generate validated Terraform fixes — cutting mean remediation time by 60%.'),
      bullet('FinOps Governance: Implemented cloud cost standards across multi-account AWS, driving $400K+ in cumulative savings through rightsizing, RI strategy, and anomaly detection automation.'),
      bullet('AI-Augmented Velocity: Drove 25% acceleration in IaC delivery through team-wide adoption of GitHub Copilot and Cursor tooling.'),

      // ── PROTEGO
      jobHeader('Cloud Infrastructure Engineer (SRE)', 'Protego Technologies', 'Dublin, Ireland', 'Sep 2022 – Oct 2023'),
      bullet('Observability Architecture: Built global observability stack (Splunk + Datadog + Prometheus) with SLO/SLI alerting, reducing MTTR by 45% across high-availability financial services workloads.'),
      bullet('Security Posture: Integrated Snyk and OWASP ZAP into automated pipelines as shift-left controls, reducing production vulnerabilities by 40%.'),
      bullet('Reliability Engineering: Owned EKS cluster operations for HA financial services — capacity planning, incident command, and runbook-driven on-call rotation.'),

      // ── HILTI
      jobHeader('Cloud SysOps Engineer (Lead)', 'Hilti Asia IT Services', 'Kuala Lumpur, Malaysia', 'Dec 2019 – Aug 2022'),
      bullet('Cost Optimisation: Delivered $120K in annual savings through Reserved Instance strategy and resource lifecycle automation across multi-region AWS.'),
      bullet('Global Standardisation: Authored CloudFormation templates enforcing security and compliance baselines across 10+ AWS regions and business units.'),
      bullet('Compliance Leadership: Led IAM governance program ensuring controls met enterprise SOC 2 and internal audit standards.'),

      // ── MAXIS
      jobHeader('Cloud Service Engineer', 'MAXIS Sdn Bhd', 'Kuala Lumpur, Malaysia', 'Jul 2018 – Dec 2019'),
      bullet('Scale Migration: Architected and migrated 30+ enterprise applications to AWS with HA/DR configurations and zero-downtime cutovers.'),
      bullet('RI Strategy: Spearheaded Reserved Instance purchasing program, reducing cloud expenditure by 15% ($80K annually).'),

      // ── DXC
      jobHeader('IT Service Delivery Consultant III (L3)', 'DXC Technology (formerly HPE)', 'Cyberjaya, Malaysia', 'Feb 2017 – Jun 2018'),
      bullet('Multi-Cloud Operations: Provided L3 architectural support across hybrid environments (AWS, Hyper-V, VMware), managing 300+ EC2 instances across 8 enterprise accounts.'),
      bullet('Automation: Developed health-check and remediation scripts that significantly reduced application downtime and manual escalation.'),

      // ── EARLIER
      new Paragraph({
        spacing: { before: 180, after: 40 },
        children: [new TextRun({ text: 'Earlier Career', bold: true, size: 20, color: COLORS.primary, font: 'Arial' })],
      }),
      para('Senior VMware Administrator (L3) · Softenger Malaysia (HPE client) · Oct 2016 – Jan 2017', { size: 18, color: COLORS.subtext, before: 30, after: 20 }),
      para('Senior IT OS Analyst · Optum / UnitedHealth Group, Noida · Nov 2014 – Oct 2016  —  IaaS automation with HP BSA Suite; vSphere and vRealize Automation for self-service provisioning.', { size: 18, color: COLORS.subtext, before: 20, after: 20 }),
      para('Associate Professional · CSC India (now DXC) · Oct 2012 – Nov 2014  —  Windows/Linux environments and VMware vSphere administration.', { size: 18, color: COLORS.subtext, before: 20, after: 20 }),
      para('Dell International & HCL India · Jul 2010 – Oct 2012  —  Enterprise technical support, Active Directory, and network device administration.', { size: 18, color: COLORS.subtext, before: 20, after: 80 }),

      // EDUCATION
      ...sectionHeading('Education'),

      new Paragraph({
        spacing: { before: 80, after: 40 },
        tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
        children: [
          new TextRun({ text: 'MBA in Information Technology', bold: true, size: 19, color: COLORS.primary, font: 'Arial' }),
          new TextRun({ text: '  ·  Sikkim Manipal University, India', size: 19, color: COLORS.text, font: 'Arial' }),
          new TextRun({ text: '\t', size: 19, font: 'Arial' }),
          new TextRun({ text: '2015', italics: true, size: 18, color: COLORS.subtext, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        spacing: { before: 30, after: 80 },
        tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
        children: [
          new TextRun({ text: 'B.E. in Computer Science', bold: true, size: 19, color: COLORS.primary, font: 'Arial' }),
          new TextRun({ text: '  ·  Visvesvaraya Technological University, Karnataka, India', size: 19, color: COLORS.text, font: 'Arial' }),
          new TextRun({ text: '\t', size: 19, font: 'Arial' }),
          new TextRun({ text: '2010', italics: true, size: 18, color: COLORS.subtext, font: 'Arial' }),
        ],
      }),

    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/Rajesh_Sood_Resume_2025.docx', buf);
  console.log('Done');
});