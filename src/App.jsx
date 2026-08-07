import { useEffect } from 'react';
import { HashRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiHome,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiSliders,
} from 'react-icons/fi';
import MobileTabBar from './components/portal/MobileTabBar';
import useNativeAppSetup from './hooks/useNativeAppSetup';
import Applications from './pages/Applications';
import Complaints from './pages/Complaints';
import Dashboard from './pages/Dashboard';
import EmailManagement from './pages/EmailManagement';
import Inspections from './pages/Inspections';
import KnowledgeCenter from './pages/KnowledgeCenter';
import MobileMore from './pages/MobileMore';
import Outlets from './pages/Outlets';
import Payments from './pages/Payments';
import Privacy from './pages/Privacy';
import Services from './pages/Services';
import { officialPortalLinks, portalApi } from './services/portalApi';
import usePortalStore from './stores/portalStore';

const navigationSections = [
  {
    label: 'Workspace',
    items: [
      { to: '/', label: 'Overview', icon: FiHome, end: true },
      { to: '/services', label: 'Services', icon: FiBriefcase },
      { to: '/applications', label: 'Applications', icon: FiFileText },
      { to: '/payments', label: 'Payments', icon: FiCreditCard },
      { to: '/inspections', label: 'Inspections', icon: FiClipboard },
    ],
  },
  {
    label: 'Property',
    items: [
      { to: '/outlets', label: 'Outlets', icon: FiMapPin },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/complaints', label: 'Complaints', icon: FiMessageSquare },
      { to: '/email', label: 'Campaigns', icon: FiMail },
    ],
  },
  {
    label: 'Help',
    items: [
      { to: '/knowledge', label: 'Knowledge', icon: FiBookOpen },
    ],
  },
];

const allNavigation = navigationSections.flatMap((section) => section.items);
const routeOnlyNavigation = [
  { to: '/more', label: 'More' },
  { to: '/privacy', label: 'Privacy' },
];

const PortalLayout = ({ children }) => {
  const location = useLocation();
  const { connected, isNative, platform } = useNativeAppSetup();
  const {
    applications,
    apiMessage,
    apiStatus,
    contrast,
    fontScale,
    setApiStatus,
    setContrast,
    setFontScale,
  } = usePortalStore();
  const current = [...allNavigation, ...routeOnlyNavigation].find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)) || allNavigation[0];
  const attentionCount = applications.filter((application) => application.status === 'Action required').length;

  useEffect(() => {
    let active = true;
    portalApi.health()
      .then((result) => active && setApiStatus('ready', result.message))
      .catch(() => active && setApiStatus('local', 'Browser-only working copy; API adapter unavailable'));
    return () => { active = false; };
  }, [setApiStatus]);

  return (
    <div className={`portal-shell ${contrast === 'high' ? 'contrast-high' : ''} ${isNative ? 'native-shell' : ''}`} style={{ '--portal-font-scale': fontScale }} data-platform={platform}>
      <a className="portal-skip-link" href="#portal-content">Skip to workspace</a>
      <aside className="portal-sidebar" aria-label="Hospitality library">
        <a href="./" className="portal-brand" aria-label="Open the public BTEA service directory">
          <span className="portal-brand-mark" aria-hidden="true">BH</span>
          <span><strong>Hospitality Hub</strong><small>Preserved operations portal</small></span>
        </a>
        <nav className="portal-nav" aria-label="Portal navigation">
          {navigationSections.map((section) => (
            <div className="portal-nav-section" key={section.label}>
              <p>{section.label}</p>
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `portal-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon aria-hidden="true" /><span>{label}</span>
                  {label === 'Applications' && attentionCount > 0 && <b aria-label={`${attentionCount} application requires attention`}>{attentionCount}</b>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className={`portal-api-status ${apiStatus}`} role="status"><i aria-hidden="true"></i><span><strong>{apiStatus === 'ready' ? 'Local adapter ready' : 'Local working copy'}</strong><small>{apiMessage}</small></span></div>
        <a className="portal-help" target="_blank" rel="noreferrer" href={officialPortalLinks.regulations}><FiBookOpen aria-hidden="true" /><span><strong>Laws & regulations</strong><small>Official portal reference</small></span></a>
        <p className="portal-note">Preparation, tracking, and simulation only. Official identity, payment, and regulatory decisions remain with BTEA.</p>
      </aside>

      <div className="portal-main">
        <header className="portal-toolbar">
          <div className="portal-toolbar-context"><span>Workspace</span><strong>{current.label}</strong></div>
          <div className="mobile-app-identity"><span aria-hidden="true">HC</span><div><strong>Hospitality Companion</strong><small>Independent service guide</small></div></div>
          <div className="portal-toolbar-actions">
            <span className={`mobile-connectivity ${connected ? 'online' : 'offline'}`}><i aria-hidden="true"></i>{connected ? 'Online' : 'Offline'}</span>
            <div className="text-size-control" aria-label="Text size controls"><button type="button" onClick={() => setFontScale(fontScale - 0.1)} aria-label="Decrease text size">A−</button><button type="button" onClick={() => setFontScale(fontScale + 0.1)} aria-label="Increase text size">A+</button></div>
            <button type="button" className="toolbar-icon-button" onClick={() => setContrast(contrast === 'high' ? 'standard' : 'high')} aria-pressed={contrast === 'high'} aria-label="Toggle high contrast"><FiSliders aria-hidden="true" /></button>
            <NavLink to="/applications" className="toolbar-icon-button notification-button" aria-label={`${attentionCount} applications require attention`}><FiBell aria-hidden="true" />{attentionCount > 0 && <b>{attentionCount}</b>}</NavLink>
            <a className="official-login-button" href={officialPortalLinks.ekey2} target="_blank" rel="noreferrer">Official eKey login</a>
            <div className="portal-property"><i aria-hidden="true"></i>TEST HOTEL</div>
          </div>
        </header>
        <main id="portal-content" className="portal-content" tabIndex="-1">
          {!connected && <div className="mobile-offline-banner" role="status">Offline mode is active. Saved services, applications, and checklists remain available on this device.</div>}
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
};

const App = () => (
  <HashRouter>
    <PortalLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:serviceId" element={<Services />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/:applicationId" element={<Applications />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/inspections" element={<Inspections />} />
        <Route path="/outlets" element={<Outlets />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/email/*" element={<EmailManagement />} />
        <Route path="/knowledge" element={<KnowledgeCenter />} />
        <Route path="/more" element={<MobileMore />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PortalLayout>
  </HashRouter>
);

export default App;
