import { FiCalendar, FiCheckCircle, FiExternalLink, FiShield } from 'react-icons/fi';
import usePortalStore from '../stores/portalStore';

const Inspections = () => {
  const { inspections, toggleInspectionItem } = usePortalStore();
  const upcoming = inspections.find((inspection) => inspection.status === 'Scheduled');
  const completed = inspections.filter((inspection) => inspection.status !== 'Scheduled');
  const progress = upcoming ? Math.round((upcoming.checklist.filter((item) => item.complete).length / upcoming.checklist.length) * 100) : 100;

  return (
    <div>
      <header className="page-heading-row"><div><span className="page-eyebrow">Inspection system</span><h1>Inspections</h1><p>Prepare evidence, verify property readiness, and preserve the separate inspection/classification workflow.</p></div><a className="secondary-action" href="https://portal.btea.bh/HCSys" target="_blank" rel="noreferrer">Official inspection login <FiExternalLink aria-hidden="true" /></a></header>
      {upcoming ? (
        <section className="inspection-hero" aria-labelledby="upcoming-inspection-title">
          <div className="inspection-date"><FiCalendar aria-hidden="true" /><strong>{new Date(upcoming.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</strong><span>{upcoming.window}</span></div>
          <div><span className="page-eyebrow">Upcoming visit</span><h2 id="upcoming-inspection-title">{upcoming.title}</h2><p>{upcoming.property} · {upcoming.id}</p><div className="readiness-bar" aria-label={`${progress}% ready`}><span style={{ width: `${progress}%` }}></span></div><small>{progress}% preparation complete</small></div>
          <span className="status-pill info">{upcoming.status}</span>
        </section>
      ) : <div className="inline-notice">No upcoming inspections in the local working copy.</div>}

      <div className="inspection-grid">
        {upcoming && <section className="workspace-card" aria-labelledby="inspection-checklist-title"><div className="workspace-card-header"><div><span className="page-eyebrow">Self-inspection</span><h2 id="inspection-checklist-title">Preparation checklist</h2></div><span className="count-badge">{upcoming.checklist.filter((item) => item.complete).length}/{upcoming.checklist.length}</span></div><div className="inspection-checklist">{upcoming.checklist.map((item) => <label key={item.id}><input type="checkbox" checked={item.complete} onChange={() => toggleInspectionItem(upcoming.id, item.id)} /><span><FiCheckCircle aria-hidden="true" /><strong>{item.label}</strong><small>{item.complete ? 'Ready' : 'Needs attention'}</small></span></label>)}</div></section>}
        <section className="workspace-card" aria-labelledby="inspection-guidance-title"><div className="workspace-card-header"><div><span className="page-eyebrow">Visit guidance</span><h2 id="inspection-guidance-title">What to expect</h2></div><FiShield aria-hidden="true" /></div><ol className="step-list roomy"><li>Confirm the official appointment and inspector details inside the authenticated system.</li><li>Prepare current licenses, safety evidence, rooms, outlets, and accessible routes.</li><li>Record evidence requests and corrective actions against the inspection case.</li><li>Use the official inspection system for the authoritative score and classification result.</li></ol></section>
      </div>

      <section className="workspace-card" aria-labelledby="inspection-history-title"><div className="workspace-card-header"><div><span className="page-eyebrow">History</span><h2 id="inspection-history-title">Completed inspections</h2></div><span className="count-badge">{completed.length}</span></div>{completed.map((inspection) => <article className="inspection-history-row" key={inspection.id}><FiCheckCircle aria-hidden="true" /><span><strong>{inspection.title}</strong><small>{inspection.id} · {new Date(inspection.date).toLocaleDateString('en-GB')}</small></span><span className="status-pill success">{inspection.status}</span></article>)}</section>
    </div>
  );
};

export default Inspections;
