import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiChevronRight,
  FiCreditCard,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import { officialPortalLinks } from '../services/portalApi';
import usePortalStore from '../stores/portalStore';

const localLinks = [
  { to: '/payments', label: 'Payments readiness', note: 'Demo ledger; official payment stays external', icon: FiCreditCard },
  { to: '/outlets', label: 'Property outlets', note: 'Prepare outlet working copies', icon: FiMapPin },
  { to: '/complaints', label: 'Complaints', note: 'Privacy-safe local preparation', icon: FiMessageSquare },
  { to: '/knowledge', label: 'Knowledge center', note: 'Official sources and regulations', icon: FiBookOpen },
  { to: '/email', label: 'Campaign workspace', note: 'Local communication drafts', icon: FiMail },
  { to: '/privacy', label: 'Privacy & data controls', note: 'How this companion handles information', icon: FiShield },
];

const MobileMore = () => {
  const [notice, setNotice] = useState('');
  const resetDemo = usePortalStore((state) => state.resetDemo);

  const reset = () => {
    resetDemo();
    setNotice('Local demonstration data was reset on this device.');
  };

  return (
    <div className="mobile-more-page">
      <header className="mobile-page-hero">
        <span className="page-eyebrow">App library</span>
        <h1>More tools</h1>
        <p>Supporting workspaces, official source links, and device-level data controls.</p>
      </header>

      {notice && <div className="inline-notice" role="status">{notice}</div>}

      <section className="mobile-menu-card" aria-label="Additional app tools">
        {localLinks.map(({ to, label, note, icon: Icon }) => (
          <Link key={to} to={to}><span className="mobile-menu-icon"><Icon aria-hidden="true" /></span><span><strong>{label}</strong><small>{note}</small></span><FiChevronRight aria-hidden="true" /></Link>
        ))}
      </section>

      <section className="mobile-source-card" aria-labelledby="mobile-source-title">
        <FiShield aria-hidden="true" />
        <div><span className="page-eyebrow">Independent companion</span><h2 id="mobile-source-title">Official actions stay official.</h2><p>This app is not BTEA and does not represent the Bahrain government. It helps prepare local working copies and links every government service back to its source.</p></div>
        <a href={officialPortalLinks.ekey2} target="_blank" rel="noreferrer">Open official eKey portal <FiExternalLink aria-hidden="true" /></a>
      </section>

      <button type="button" className="mobile-reset-button" onClick={reset}><FiRefreshCw aria-hidden="true" /><span><strong>Reset local app data</strong><small>Restores the synthetic demonstration records</small></span></button>
      <p className="mobile-build-label">Hospitality Services Companion · Version 2.1.0 · 2026 policy profile</p>
    </div>
  );
};

export default MobileMore;
