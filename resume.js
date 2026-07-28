const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rajesh Sood Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: ${COLORS.text}; }
    .page { max-width: 8.5in; height: 11in; margin: 0 auto; padding: 0.6in 0.75in; background: white; }
    .header { margin-bottom: 0.3in; border-bottom: 3px solid ${COLORS.primary}; padding-bottom: 0.2in; }
    .name { font-size: 2.4em; font-weight: 900; color: ${COLORS.primary}; margin-bottom: 0.05in; }
    .name .mba { font-size: 0.5em; color: ${COLORS.accent}; }
    .tagline { font-size: 0.85em; color: ${COLORS.subtext}; margin-bottom: 0.1in; }
    .contact { font-size: 0.8em; display: flex; gap: 1em; flex-wrap: wrap; color: ${COLORS.subtext}; }
    .contact a { color: ${COLORS.accent}; text-decoration: none; }
    .section-title { font-size: 1.15em; font-weight: 800; color: ${COLORS.primary}; margin-top: 0.25in; margin-bottom: 0.15in; border-bottom: 2px solid ${COLORS.accent}; padding-bottom: 0.08in; }
    .summary { font-size: 0.92em; line-height: 1.6; margin-bottom: 0.2in; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.15in; margin-bottom: 0.25in; }
    .metric { background: ${COLORS.light}; padding: 0.2in; text-align: center; border-radius: 4px; }
    .metric-value { font-size: 1.6em; font-weight: 900; color: ${COLORS.primary}; }
    .metric-label { font-size: 0.75em; color: ${COLORS.subtext}; margin-top: 0.05in; }
    .skills-table { width: 100%; border-collapse: collapse; font-size: 0.9em; margin-bottom: 0.2in; }
    .skills-table td { padding: 0.08in 0.1in; vertical-align: top; }
    .skills-table td:first-child { font-weight: 700; color: ${COLORS.primary}; width: 15%; }
    .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.15in; margin-bottom: 0.05in; font-weight: 600; }
    .job-title { font-size: 0.95em; color: ${COLORS.primary}; }
    .job-company { color: ${COLORS.accent}; }
    .job-meta { font-size: 0.85em; color: ${COLORS.subtext}; }
    .job-intro { font-size: 0.85em; font-style: italic; color: ${COLORS.subtext}; margin-bottom: 0.08in; }
    .bullets { margin-left: 0.2in; font-size: 0.9em; line-height: 1.5; margin-bottom: 0.1in; }
    .bullet { margin-bottom: 0.08in; }
    .bullet::before { content: '▸ '; color: ${COLORS.accent}; font-weight: bold; margin-right: 0.05in; }
    .cert-item { font-size: 0.9em; margin-bottom: 0.1in; }
    .cert-star { color: ${COLORS.primary}; font-weight: bold; }
    .education { display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 0.1in; }
    .edu-left { }
    .edu-right { text-align: right; color: ${COLORS.subtext}; font-style: italic; }
    .earlier-title { font-weight: 600; margin-top: 0.1in; margin-bottom: 0.05in; font-size: 0.9em; }
    .earlier-bullets { margin-left: 0.2in; font-size: 0.85em; line-height: 1.4; }
    .earlier-item { margin-bottom: 0.05in; }
    .earlier-item::before { content: '▪ '; color: ${COLORS.text}; margin-right: 0.05in; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="name">RAJESH SOOD<span class="mba">, MBA</span></div>
      <div class="tagline">Senior Cloud & DevOps Engineer · AI/ML Platform Engineering · AWS · Kubernetes · Terraform · SRE</div>
      <div class="contact">
        <span>✉ soodrajesh87@gmail.com</span>
        <span>🔗 <a href="https://linkedin.com/in/rajeshsood">linkedin.com/in/rajeshsood</a></span>
        <span>⌥ <a href="https://github.com/soodrajesh">github.com/soodrajesh</a></span>
        <span>📍 Dublin, Ireland</span>
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
      <tr>
        <td>AI/ML Platform:</td>
        <td>AWS SageMaker, AWS Bedrock, RAG Pipeline Design, LLM Integration (Claude, Titan), GenAI Ops</td>
      </tr>
      <tr>
        <td>Cloud Architecture:</td>
        <td>AWS (EKS, Networking, Serverless) · Azure · GCP · OCI — multi-region, multi-account</td>
      </tr>
      <tr>
        <td>Platform Eng & IaC:</td>
        <td>Terraform, CloudFormation, Helm, Ansible — Internal developer platforms · Self-service infra</td>
      </tr>
      <tr>
        <td>SRE & Reliability:</td>
        <td>SLO/SLI/Error-budget design · Incident command · Splunk, Datadog, Prometheus/Grafana</td>
      </tr>
      <tr>
        <td>CI/CD & DevOps:</td>
        <td>Jenkins, GitHub Actions · Shift-left testing · 35% cycle-time reduction achieved</td>
      </tr>
      <tr>
        <td>Security/Compliance:</td>
        <td>DevSecOps (Wiz, Snyk, SonarQube) · IAM zero-trust design · GDPR, SOC 2, HIPAA · Automated remediation pipelines</td>
      </tr>
      <tr>
        <td>AI-Augmented Eng:</td>
        <td>GitHub Copilot, Cursor, Claude/Bedrock — IaC generation, log analysis, vulnerability auto-remediation workflows</td>
      </tr>
    </table>

    <div class="section-title">CERTIFICATIONS</div>
    <div class="cert-item"><span class="cert-star">★</span> AWS Certified Solutions Architect – Professional (Valid Dec 2026) · <a href="https://credly.com/users/rajeshsood" style="color: ${COLORS.accent}; text-decoration: none;">credly.com/users/rajeshsood</a></div>
    <div class="cert-item">Previously Certified: Microsoft Azure (Exam 533) · Google Cloud Professional Architect · Oracle OCI Architect Professional & Associate</div>

    <div class="section-title">PROFESSIONAL EXPERIENCE</div>

    <div class="job-header">
      <span><span class="job-title">Senior DevOps Engineer</span> · <span class="job-company">Workday</span> · <span class="job-meta">Dublin, Ireland</span></span>
      <span class="job-meta">Oct 2023 – Present</span>
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
      <span><span class="job-title">Cloud Infrastructure Engineer (SRE)</span> · <span class="job-company">Protego Technologies</span> · <span class="job-meta">Dublin, Ireland</span></span>
      <span class="job-meta">Sep 2022 – Oct 2023</span>
    </div>
    <div class="bullets">
      <div class="bullet"><strong>Observability Architecture:</strong> Built global observability stack (Splunk + Datadog + Prometheus) with SLO/SLI alerting, reducing MTTR by 45% across high-availability financial services workloads.</div>
      <div class="bullet"><strong>Security Posture:</strong> Integrated Snyk and OWASP ZAP into automated pipelines as shift-left controls, reducing production vulnerabilities by 40%.</div>
      <div class="bullet"><strong>Reliability Engineering:</strong> Owned EKS cluster operations for HA financial services — capacity planning, incident command, and runbook-driven on-call rotation.</div>
    </div>

    <div class="job-header">
      <span><span class="job-title">Cloud SysOps Engineer (Lead)</span> · <span class="job-company">Hilti Asia IT Services</span> · <span class="job-meta">Kuala Lumpur, Malaysia</span></span>
      <span class="job-meta">Dec 2019 – Aug 2022</span>
    </div>
    <div class="bullets">
      <div class="bullet"><strong>Cost Optimisation:</strong> Delivered $120K in annual savings through Reserved Instance strategy and resource lifecycle automation across multi-region AWS.</div>
      <div class="bullet"><strong>Global Standardisation:</strong> Authored CloudFormation templates enforcing security and compliance baselines across 10+ AWS regions and business units.</div>
      <div class="bullet"><strong>Compliance Leadership:</strong> Led IAM governance program ensuring controls met enterprise SOC 2 and internal audit standards.</div>
    </div>

    <div class="job-header">
      <span><span class="job-title">Cloud Service Engineer</span> · <span class="job-company">MAXIS Sdn Bhd</span> · <span class="job-meta">Kuala Lumpur, Malaysia</span></span>
      <span class="job-meta">Jul 2018 – Dec 2019</span>
    </div>
    <div class="bullets">
      <div class="bullet"><strong>Scale Migration:</strong> Architected and migrated 30+ enterprise applications to AWS with HA/DR configurations and zero-downtime cutovers.</div>
      <div class="bullet"><strong>RI Strategy:</strong> Spearheaded Reserved Instance purchasing program, reducing cloud expenditure by 15% ($80K annually).</div>
    </div>

    <div class="job-header">
      <span><span class="job-title">IT Service Delivery Consultant III (L3)</span> · <span class="job-company">DXC Technology (formerly HPE)</span> · <span class="job-meta">Cyberjaya, Malaysia</span></span>
      <span class="job-meta">Feb 2017 – Jun 2018</span>
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
      <span class="edu-left"><strong>MBA in Information Technology</strong> · Sikkim Manipal University, India</span>
      <span class="edu-right">2015</span>
    </div>
    <div class="education">
      <span class="edu-left"><strong>B.E. in Computer Science</strong> · Visvesvaraya Technological University, Karnataka, India</span>
      <span class="edu-right">2010</span>
    </div>
  </div>
</body>
</html>
`;

async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlTemplate);
  await page.pdf({ path: 'Rajesh_Sood_Resume_2025.pdf', format: 'letter' });
  await browser.close();
}

async function main() {
  fs.writeFileSync('resume.html', htmlTemplate);
  await generatePDF();
  console.log('Done');
}

main().catch(console.error);
