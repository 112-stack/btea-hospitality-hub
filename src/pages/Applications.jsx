import { useMemo, useState } from 'react';
import { FiCheck, FiFile, FiPlus, FiSearch, FiUploadCloud } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { getOfficialService } from '../data/officialServices';
import usePortalStore from '../stores/portalStore';

const stages = ['Draft', 'Ready', 'Review', 'Payment', 'Complete'];

const statusClass = (status) => {
  if (status === 'Completed') return 'success';
  if (status === 'Action required') return 'warning';
  if (status === 'Under review') return 'info';
  return 'neutral';
};

const Applications = () => {
  const { applicationId } = useParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { applications, addApplicationDocument, advanceApplication } = usePortalStore();
  const selected = applications.find((application) => application.id === applicationId) || applications[0];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((application) => {
      const textMatches = !needle || `${application.id} ${application.title} ${application.status}`.toLowerCase().includes(needle);
      const statusMatches = filter === 'all' || application.status === filter;
      return textMatches && statusMatches;
    });
  }, [applications, filter, query]);

  const handleFiles = (event) => {
    if (!selected) return;
    Array.from(event.target.files || []).slice(0, 10).forEach((file) => addApplicationDocument(selected.id, file));
    event.target.value = '';
  };

  return (
    <div>
      <header className="page-heading-row"><div><span className="page-eyebrow">Case library</span><h1>Applications</h1><p>Track drafts, evidence, review, payment readiness, and completed service outcomes in one timeline.</p></div><Link className="btn-btea action-button" to="/services">New application <FiPlus aria-hidden="true" /></Link></header>
      <div className="application-workspace">
        <section className="application-list-panel" aria-labelledby="application-list-title">
          <div className="workspace-card-header"><div><span className="page-eyebrow">Working cases</span><h2 id="application-list-title">Application library</h2></div><span className="count-badge">{filtered.length}</span></div>
          <label className="workspace-search"><FiSearch aria-hidden="true" /><span className="sr-only">Search applications</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference or service" /></label>
          <label className="field-label" htmlFor="application-status-filter">Status</label>
          <select id="application-status-filter" className="workspace-select" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option>{Array.from(new Set(applications.map((item) => item.status))).map((status) => <option key={status}>{status}</option>)}</select>
          <div className="application-list">
            {filtered.map((application) => (
              <Link key={application.id} to={`/applications/${encodeURIComponent(application.id)}`} className={`application-list-item ${selected?.id === application.id ? 'active' : ''}`}>
                <span><strong>{application.title}</strong><small>{application.id}</small></span>
                <span className={`status-pill ${statusClass(application.status)}`}>{application.status}</span>
                <time dateTime={application.updatedAt}>Updated {new Date(application.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</time>
              </Link>
            ))}
          </div>
        </section>

        <section className="application-detail-panel" aria-live="polite">
          {selected ? <ApplicationDetail application={selected} onFiles={handleFiles} onAdvance={() => advanceApplication(selected.id)} /> : <div className="panel-empty"><FiFile aria-hidden="true" /><h2>No applications</h2><p>Start from the Services library to create the first working copy.</p></div>}
        </section>
      </div>
    </div>
  );
};

const ApplicationDetail = ({ application, onFiles, onAdvance }) => {
  const service = getOfficialService(application.serviceId);
  const complete = application.stage >= 5;
  return (
    <>
      <div className="application-detail-heading"><div><span className="page-eyebrow">{application.id}</span><h2>{application.title}</h2><p>{service?.title || 'BTEA service'} · TEST HOTEL</p></div><span className={`status-pill large ${statusClass(application.status)}`}>{application.status}</span></div>
      <div className="application-progress" aria-label={`Application stage ${application.stage} of 5`}>
        {stages.map((stage, index) => <div key={stage} className={index < application.stage ? 'complete' : ''}><span>{index < application.stage ? <FiCheck aria-hidden="true" /> : index + 1}</span><small>{stage}</small></div>)}
      </div>
      <div className="case-note" role="status">{application.note}</div>
      <div className="application-detail-grid">
        <section className="case-section"><div className="case-section-heading"><div><span className="page-eyebrow">Evidence</span><h3>Documents</h3></div><label className="upload-button"><FiUploadCloud aria-hidden="true" /> Add files<input type="file" multiple onChange={onFiles} /></label></div>
          {application.documents.length ? <ul className="document-list">{application.documents.map((document) => <li key={document.id}><FiFile aria-hidden="true" /><span><strong>{document.name}</strong><small>{document.size ? `${Math.ceil(document.size / 1024)} KB · ` : ''}{document.status}</small></span><time dateTime={document.uploadedAt}>{new Date(document.uploadedAt).toLocaleDateString('en-GB')}</time></li>)}</ul> : <div className="case-empty">No files in this working copy.</div>}
        </section>
        <section className="case-section"><span className="page-eyebrow">Published requirements</span><h3>Readiness checklist</h3><ul className="requirement-list compact">{(service?.documents || ['Review the authenticated service requirements.']).map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
      <div className="case-footer"><p>Local demonstration only. Advancing a case changes this device’s working copy and never creates an official submission.</p><button type="button" className="btn-btea action-button" onClick={onAdvance} disabled={complete}>{complete ? 'Workflow complete' : 'Advance local stage'}</button></div>
    </>
  );
};

export default Applications;

