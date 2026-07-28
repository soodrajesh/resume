const puppeteer = require('puppeteer');
const fs = require('fs');

const COLORS = {
  primary:  '#1B3A6B',
  accent:   '#2E75B6',
  light:    '#D6E4F0',
  text:     '#1A1A1A',
  subtext:  '#555555',
};

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

async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlTemplate);
  await page.pdf({
    path: 'Rajesh_Sood_Resume_2025.pdf',
    format: 'letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.65in', right: '0.65in' },
  });
  await browser.close();
}

async function main() {
  fs.writeFileSync('resume.html', htmlTemplate);
  await generatePDF();
  console.log('Done');
}

main().catch(console.error);
