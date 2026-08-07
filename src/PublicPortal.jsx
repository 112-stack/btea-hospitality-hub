import { useMemo, useState } from 'react';
import { FiArrowRight, FiExternalLink, FiSearch, FiShield, FiSliders, FiX } from 'react-icons/fi';
import ServiceIcon from './components/portal/ServiceIcon';
import { officialServices, serviceAudiences } from './data/officialServices';
import { officialPortalLinks } from './services/portalApi';
import usePortalStore from './stores/portalStore';

const statusLabel = {
  published: 'Published details',
  partial: 'Partial official details',
  'content-pending': 'Details pending',
  'login-only': 'Login required',
};

const PublicPortal = () => {
  const [query, setQuery] = useState('');
  const [audience, setAudience] = useState('all');
  const [selectedId, setSelectedId] = useState('1');
  const [noticeVisible, setNoticeVisible] = useState(true);
  const { fontScale, contrast, setFontScale, setContrast } = usePortalStore();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return officialServices.filter((service) => {
      const audienceMatches = audience === 'all' || service.audience === audience;
      const textMatches = !needle || `${service.title} ${service.summary} ${service.shortTitle}`.toLowerCase().includes(needle);
      return audienceMatches && textMatches;
    });
  }, [audience, query]);

  const selected = officialServices.find((service) => service.id === selectedId) || filtered[0] || officialServices[0];

  return (
    <div className={`public-portal ${contrast === 'high' ? 'contrast-high' : ''}`} style={{ '--portal-font-scale': fontScale }}>
      <a className="portal-skip-link" href="#service-directory">Skip to services</a>
      <header className="public-header">
        <a className="public-brand" href="#top" aria-label="BTEA preserved e-services home">
          <img className="public-official-logo" src="/Content/images/btea-logo-tr-002.png" alt="Bahrain Tourism and Exhibitions Authority" />
          <span className="public-brand-copy"><strong>Preserved e-services</strong><small>Independent, source-attributed directory</small></span>
        </a>
        <nav aria-label="Public portal navigation">
          <a href="#service-directory">Services</a>
          <a href={officialPortalLinks.faq} target="_blank" rel="noreferrer">Knowledge</a>
          <a href="portal.html#/complaints">Complaints</a>
        </nav>
        <div className="public-header-actions">
          <button type="button" className="icon-control" onClick={() => setFontScale(fontScale - 0.1)} aria-label="Decrease text size">A−</button>
          <button type="button" className="icon-control" onClick={() => setFontScale(fontScale + 0.1)} aria-label="Increase text size">A+</button>
          <button type="button" className="icon-control" onClick={() => setContrast(contrast === 'high' ? 'standard' : 'high')} aria-pressed={contrast === 'high'} aria-label="Toggle high contrast"><FiSliders aria-hidden="true" /></button>
          <a className="public-login-secondary" href={officialPortalLinks.login} target="_blank" rel="noreferrer">Official login</a>
          <a className="public-login" href={officialPortalLinks.ekey2} target="_blank" rel="noreferrer">eKey 2.0</a>
        </div>
      </header>

      <main id="top">
        <section className="public-hero" aria-labelledby="public-hero-title">
          <div>
            <span className="page-eyebrow">Bahrain tourism services</span>
            <h1 id="public-hero-title">Every BTEA service.<br /><em>One clear starting point.</em></h1>
            <p>Explore the full public service surface, understand requirements before login, and prepare a local working copy without sending data to protected production systems.</p>
            <div className="public-hero-actions">
              <a className="btn-btea public-button" href="#service-directory">Explore 19 services <FiArrowRight aria-hidden="true" /></a>
              <a className="public-button secondary" href="portal.html">Open property workspace</a>
            </div>
            <p className="public-disclaimer"><FiShield aria-hidden="true" /> Independent preservation and UX demonstration. Official submissions continue on portal.btea.bh.</p>
          </div>
          <aside className="public-hero-card" aria-label="Service directory summary">
            <span>Service directory</span>
            <strong>19</strong>
            <p>14 property services · 4 individual services · 1 public complaint channel</p>
            <div><i></i><span>Official source checked 07 Aug 2026</span></div>
          </aside>
        </section>

        <section id="service-directory" className="public-directory" aria-labelledby="directory-title">
          <div className="public-section-heading">
            <div><span className="page-eyebrow">E-services directory</span><h2 id="directory-title">Find the right service</h2></div>
            <label className="public-search"><FiSearch aria-hidden="true" /><span className="sr-only">Search services</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search licenses, levy, inspections…" /></label>
          </div>

          <div className="public-segments" aria-label="Filter services by audience">
            {Object.entries(serviceAudiences).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setAudience(key)} aria-pressed={audience === key}>{label}</button>
            ))}
          </div>

          <div className="public-library-layout">
            <div className="public-service-grid" aria-live="polite">
              {filtered.length ? filtered.map((service) => (
                <button key={service.id} type="button" className={`public-service-card ${selected.id === service.id ? 'selected' : ''}`} onClick={() => setSelectedId(service.id)} aria-pressed={selected.id === service.id}>
                  <span className="service-icon"><ServiceIcon name={service.icon} /></span>
                  <span className="public-service-copy"><strong>{service.title}</strong><small>{service.summary}</small></span>
                  <span className={`service-content-status ${service.status}`}>{statusLabel[service.status]}</span>
                </button>
              )) : <div className="public-empty"><FiSearch aria-hidden="true" /><strong>No matching services</strong><span>Try a broader name or switch the audience filter.</span></div>}
            </div>

            <aside className="public-service-detail" aria-labelledby="selected-service-title">
              <div className="public-detail-title"><span className="service-icon large"><ServiceIcon name={selected.icon} /></span><div><span>{serviceAudiences[selected.audience]}</span><h3 id="selected-service-title">{selected.title}</h3></div></div>
              <p>{selected.summary}</p>
              <dl className="public-service-facts">
                <div><dt>Expected duration</dt><dd>{selected.duration}</dd></div>
                <div><dt>Published fees</dt><dd>{selected.fees}</dd></div>
              </dl>
              <div className="public-mini-list"><strong>Prepare before you start</strong><ul>{selected.documents.slice(0, 3).map((document) => <li key={document}>{document}</li>)}</ul></div>
              <div className="public-detail-actions">
                <a className="btn-btea public-button" href={`portal.html#/services/${selected.id}`}>Prepare locally <FiArrowRight aria-hidden="true" /></a>
                <a className="public-button secondary" href={selected.sourceUrl} target="_blank" rel="noreferrer">Official page <FiExternalLink aria-hidden="true" /></a>
              </div>
            </aside>
          </div>
        </section>

        <section className="public-improvements" aria-labelledby="improvements-title">
          <div><span className="page-eyebrow">Improved workflow</span><h2 id="improvements-title">Know what is needed before authentication.</h2></div>
          <div className="public-improvement-grid">
            <article><strong>01</strong><h3>Compare services</h3><p>Search across every observed BTEA service and filter by applicant type.</p></article>
            <article><strong>02</strong><h3>Prepare documents</h3><p>Turn published requirements into a readiness checklist and a local draft.</p></article>
            <article><strong>03</strong><h3>Track one timeline</h3><p>Follow applications, inspections, payment readiness, and support references together.</p></article>
          </div>
        </section>
      </main>

      {noticeVisible && (
        <aside className="public-privacy" aria-label="Privacy notice">
          <div><strong>Privacy-first demonstration</strong><span>This local version stores working data on this device and does not call protected BTEA submission or payment endpoints.</span></div>
          <button type="button" onClick={() => setNoticeVisible(false)} aria-label="Dismiss privacy notice"><FiX aria-hidden="true" /></button>
        </aside>
      )}

      <footer className="public-footer">
        <div><strong>BTEA preserved portal</strong><span>Public service information linked to its official source. BTEA logo artwork is reproduced from portal.btea.bh for source identification; this project remains independent.</span></div>
        <div><a href={officialPortalLinks.contact} target="_blank" rel="noreferrer">Contact BTEA</a><a href={officialPortalLinks.accessibility} target="_blank" rel="noreferrer">Accessibility</a><a href="mailto:esupport@btea.bh">esupport@btea.bh</a><a href="tel:+97317558800">+973 1755 8800</a></div>
      </footer>
    </div>
  );
};

export default PublicPortal;
