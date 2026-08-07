import { FiExternalLink, FiShield } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { officialPortalLinks } from '../services/portalApi';

const Privacy = () => (
  <article className="privacy-page">
    <header className="mobile-page-hero"><span className="page-eyebrow">Last updated 07 August 2026</span><h1>Privacy & data controls</h1><p>A plain-language summary for the Hospitality Services Companion mobile app.</p></header>
    <div className="privacy-summary"><FiShield aria-hidden="true" /><div><strong>No developer collection</strong><p>The companion does not transmit personal information, analytics, advertising identifiers, or tracking data to the independent developer.</p></div></div>
    <section><h2>Information kept on your device</h2><p>Service favorites, synthetic applications, document names and sizes, inspection checklists, complaint working copies, accessibility settings, outlets, and campaign drafts can be stored locally. Uploaded document bytes are not sent by the companion.</p></section>
    <section><h2>Official services</h2><p>When you choose an official BTEA source, eKey sign-in, payment, inspection, or complaint page, you leave the companion and use the government service under its own terms and privacy practices. The companion does not receive credentials or results from those external flows.</p><a href={officialPortalLinks.accessibility} target="_blank" rel="noreferrer">Open an official BTEA source <FiExternalLink aria-hidden="true" /></a></section>
    <section><h2>Permissions and tracking</h2><p>The current release does not request location, camera, microphone, contacts, photos, advertising ID, or tracking permission. Network status is read only to show whether official links are available. Optional haptics provide touch feedback.</p></section>
    <section><h2>Retention and deletion</h2><p>Local working data stays on the device until you reset it, clear application storage, or uninstall the app. There is no companion account to delete and no remote developer database containing app data.</p><Link to="/more">Open local data controls</Link></section>
    <section><h2>Contact</h2><p>Questions about this independent companion can be filed in the project support tracker. Questions about BTEA services should go to BTEA through its official contact page.</p><a href="https://github.com/112-stack/btea-hospitality-hub/issues" target="_blank" rel="noreferrer">Project support <FiExternalLink aria-hidden="true" /></a></section>
  </article>
);

export default Privacy;
