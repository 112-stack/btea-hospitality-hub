import { FiExternalLink, FiFileText, FiHelpCircle, FiShield } from 'react-icons/fi';
import { officialServiceCounts, officialServices } from '../data/officialServices';
import { officialPortalLinks } from '../services/portalApi';

const faqs = [
  { question: 'Why do some services say “Official details pending”?', answer: 'The current public BTEA description page has not published duration, fee, document, or step details. This preservation labels the gap instead of inventing requirements.' },
  { question: 'Does a local working copy become an official application?', answer: 'No. A local draft is preparation only. Authentication, authoritative submission, payment, and final status remain in the official portal.' },
  { question: 'Which login should be used?', answer: 'The public portal currently exposes both its established eKey route and eKey 2.0. Use the route required by the official service and your Bahrain eKey account.' },
  { question: 'Can files be uploaded safely here?', answer: 'The demonstration stores only file metadata for readiness. It does not send document bytes to BTEA or another remote service.' },
  { question: 'Where are inspection results authoritative?', answer: 'The separate BTEA Inspection System remains the source of truth for inspection scheduling, scoring, and classification decisions.' },
];

const links = [
  { label: 'Help & guidance', href: 'https://portal.btea.bh/MainP/HelpAndGuidance' },
  { label: 'Frequently asked questions', href: officialPortalLinks.faq },
  { label: 'Laws & regulations', href: officialPortalLinks.regulations },
  { label: 'Circulars', href: officialPortalLinks.circulars },
  { label: 'Accessibility', href: officialPortalLinks.accessibility },
  { label: 'Contact BTEA', href: officialPortalLinks.contact },
];

const KnowledgeCenter = () => {
  const fullyPublished = officialServices.filter((service) => service.status === 'published').length;
  return (
    <div>
      <header className="page-heading-row"><div><span className="page-eyebrow">Knowledge center</span><h1>Guidance & regulations</h1><p>Official source links, service-content health, and practical preparation guidance in one accessible library.</p></div><a className="secondary-action" href={officialPortalLinks.faq} target="_blank" rel="noreferrer">Official FAQs <FiExternalLink aria-hidden="true" /></a></header>
      <section className="knowledge-health" aria-label="Service content health"><article><span>Observed services</span><strong>{officialServiceCounts.all}</strong><small>Every public card preserved</small></article><article><span>Detailed services</span><strong>{fullyPublished}</strong><small>Requirements publicly available</small></article><article><span>Content gaps</span><strong>{officialServiceCounts.contentPending}</strong><small>Clearly labelled, never invented</small></article></section>
      <div className="knowledge-layout">
        <section className="workspace-card" aria-labelledby="knowledge-links-title"><div className="workspace-card-header"><div><span className="page-eyebrow">Official sources</span><h2 id="knowledge-links-title">BTEA reference library</h2></div><FiFileText aria-hidden="true" /></div><div className="knowledge-links">{links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer"><span><strong>{link.label}</strong><small>portal.btea.bh</small></span><FiExternalLink aria-hidden="true" /></a>)}</div></section>
        <section className="workspace-card" aria-labelledby="portal-audit-title"><div className="workspace-card-header"><div><span className="page-eyebrow">Preservation audit</span><h2 id="portal-audit-title">Improvements made</h2></div><FiShield aria-hidden="true" /></div><ul className="audit-list"><li><strong>One dependency path</strong><span>Removes duplicate jQuery, Bootstrap, icon-font, and reCAPTCHA loads seen on the public pages.</span></li><li><strong>Semantic controls</strong><span>Replaces unlabeled icon buttons and empty headings with clear names, landmarks, and focus states.</span></li><li><strong>Privacy-safe verification</strong><span>Uses POST for local complaint verification instead of placing phone numbers or codes in query strings.</span></li><li><strong>Honest content gaps</strong><span>Marks unpublished requirements rather than presenting incomplete pages as ready.</span></li><li><strong>Unified case timeline</strong><span>Connects preparation, evidence, inspection, payment readiness, and support references.</span></li></ul></section>
      </div>
      <section className="workspace-card faq-section" aria-labelledby="faq-title"><div className="workspace-card-header"><div><span className="page-eyebrow">Common questions</span><h2 id="faq-title">Before you start</h2></div><FiHelpCircle aria-hidden="true" /></div>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
    </div>
  );
};

export default KnowledgeCenter;
