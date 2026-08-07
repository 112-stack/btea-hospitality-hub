import { useMemo, useState } from 'react';
import { FiArrowRight, FiExternalLink, FiSearch, FiStar } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ServiceIcon from '../components/portal/ServiceIcon';
import { getOfficialService, officialServices, serviceAudiences } from '../data/officialServices';
import { portalApi } from '../services/portalApi';
import usePortalStore from '../stores/portalStore';

const statusCopy = {
  published: 'Official details published',
  partial: 'Some official details pending',
  'content-pending': 'Official content pending',
  'login-only': 'Details available after login',
};

const Services = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [audience, setAudience] = useState('all');
  const [notice, setNotice] = useState('Select a service to review requirements before starting.');
  const { createApplication, favoriteServiceIds, toggleFavorite } = usePortalStore();
  const selected = getOfficialService(serviceId || '1');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return officialServices.filter((service) => (audience === 'all' || service.audience === audience)
      && (!needle || `${service.title} ${service.summary}`.toLowerCase().includes(needle)));
  }, [audience, query]);

  const startService = async (service) => {
    if (service.id === 'complaints') return navigate('/complaints');
    if (service.id === 'inspection') return navigate('/inspections');
    if (service.id === '6') return navigate('/outlets');
    const application = createApplication(service.id);
    try {
      await portalApi.createApplication({ serviceId: service.id, propertyId: application.propertyId, title: application.title });
      setNotice('Draft created in the local workspace and mirrored to the local API adapter.');
    } catch {
      setNotice('Draft created locally. The optional API adapter is unavailable, so no network write occurred.');
    }
    navigate(`/applications/${encodeURIComponent(application.id)}`);
  };

  return (
    <div>
      <header className="page-heading-row"><div><span className="page-eyebrow">E-services library</span><h1>Services</h1><p>All 19 service surfaces observed on the public BTEA portal, with requirements and source links.</p></div><a className="secondary-action" href="/" target="_blank">Public directory <FiExternalLink aria-hidden="true" /></a></header>
      <div className="inline-notice" role="status">{notice}</div>
      <div className="service-workspace">
        <section className="service-library-panel" aria-labelledby="service-library-title">
          <div className="workspace-card-header"><div><span className="page-eyebrow">Library</span><h2 id="service-library-title">Browse services</h2></div><span className="count-badge">{filtered.length}</span></div>
          <label className="workspace-search"><FiSearch aria-hidden="true" /><span className="sr-only">Search services</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" /></label>
          <label className="field-label" htmlFor="service-audience">Audience</label>
          <select id="service-audience" className="workspace-select" value={audience} onChange={(event) => setAudience(event.target.value)}>{Object.entries(serviceAudiences).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select>
          <div className="service-list">
            {filtered.map((service) => (
              <Link key={service.id} to={`/services/${service.id}`} className={`service-list-item ${selected?.id === service.id ? 'active' : ''}`}>
                <span className="service-icon"><ServiceIcon name={service.icon} /></span>
                <span><strong>{service.title}</strong><small>{service.duration}</small></span>
                {favoriteServiceIds.includes(service.id) && <FiStar className="favorite-mark" aria-label="Favorite" />}
              </Link>
            ))}
          </div>
        </section>

        <section className="service-detail-panel" aria-live="polite">
          {selected ? (
            <>
              <div className="service-detail-heading">
                <span className="service-icon xl"><ServiceIcon name={selected.icon} /></span>
                <div><span>{serviceAudiences[selected.audience]}</span><h2>{selected.title}</h2><small className={`service-content-status ${selected.status}`}>{statusCopy[selected.status]}</small></div>
                <button type="button" className="favorite-button" onClick={() => toggleFavorite(selected.id)} aria-pressed={favoriteServiceIds.includes(selected.id)} aria-label={`${favoriteServiceIds.includes(selected.id) ? 'Remove' : 'Add'} ${selected.title} ${favoriteServiceIds.includes(selected.id) ? 'from' : 'to'} favorites`}><FiStar aria-hidden="true" /></button>
              </div>
              <p className="service-summary">{selected.summary}</p>
              <dl className="service-facts"><div><dt>Expected duration</dt><dd>{selected.duration}</dd></div><div><dt>Published fees</dt><dd>{selected.fees}</dd></div></dl>
              <div className="service-detail-columns">
                <section><h3>Document readiness</h3><ul className="requirement-list">{selected.documents.map((item) => <li key={item}>{item}</li>)}</ul></section>
                <section><h3>Official workflow</h3><ol className="step-list">{selected.steps.map((item) => <li key={item}>{item}</li>)}</ol></section>
              </div>
              <div className="service-detail-actions"><button type="button" className="btn-btea action-button" onClick={() => startService(selected)}>Start local working copy <FiArrowRight aria-hidden="true" /></button><a className="secondary-action" href={selected.sourceUrl} target="_blank" rel="noreferrer">Open official source <FiExternalLink aria-hidden="true" /></a></div>
              <p className="safety-note">This working copy helps prepare data and documents. It never submits to protected BTEA endpoints or processes real payments.</p>
            </>
          ) : <div className="panel-empty"><FiSearch aria-hidden="true" /><h2>Select a service</h2><p>Choose a service from the library to review its public requirements.</p></div>}
        </section>
      </div>
    </div>
  );
};

export default Services;
