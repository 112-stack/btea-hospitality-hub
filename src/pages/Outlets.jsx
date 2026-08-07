import { useEffect, useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import OutletForm from '../components/OutletForm';

const storageKey = 'btea-local-outlets-v2';

const initialOutlets = () => {
  if (window.outletData?.processingOutlets) return window.outletData.processingOutlets;
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {
    return [];
  }
};

const Outlets = () => {
  const [showOutletForm, setShowOutletForm] = useState(false);
  const [editMode, setEditMode] = useState('create');
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [outlets, setOutlets] = useState(initialOutlets);
  const [notice, setNotice] = useState('Outlet changes are stored as a local working copy until an approved host adapter is configured.');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(outlets));
  }, [outlets]);

  const handleCreateOutlet = () => {
    setEditMode('create');
    setSelectedOutlet(null);
    setShowOutletForm(true);
  };

  const handleEditOutlet = (outlet) => {
    setEditMode('edit');
    setSelectedOutlet(outlet);
    setShowOutletForm(true);
  };

  const handleFormSubmit = async (formData) => {
    let synced = false;
    const syncUrl = import.meta.env.VITE_BTEA_OUTLET_SYNC_URL;
    if (syncUrl) {
      try {
        const response = await fetch(syncUrl, { method: 'POST', body: formData });
        synced = response.ok;
      } catch {
        synced = false;
      }
    }

    const values = Object.fromEntries(formData);
    if (editMode === 'create') {
      const id = values.id || globalThis.crypto?.randomUUID?.() || `local-${Date.now()}`;
      setOutlets((current) => [...current, { ...values, id, status: values.status || 'Draft' }]);
    } else {
      setOutlets((current) => current.map((outlet) => outlet.id === selectedOutlet?.id ? { ...outlet, ...values, status: 'Edited' } : outlet));
    }
    setShowOutletForm(false);
    setSelectedOutlet(null);
    setNotice(synced ? 'Outlet saved and synchronized through the configured host adapter.' : 'Outlet saved in this local working copy. No protected production endpoint was called.');
  };

  const handleDeleteOutlet = (outlet) => {
    if (!confirm(`Delete the local working copy for “${outlet.name || 'this outlet'}”?`)) return;
    setOutlets((current) => current.filter((item) => item.id !== outlet.id));
    setNotice('Local outlet working copy deleted.');
  };

  return (
    <div className="outlet-page">
      <header className="page-heading-row">
        <div><span className="page-eyebrow">Property operations</span><h1>Outlets</h1><p>Prepare additions and changes using the fields required by the observed Edit Outlet workflow.</p></div>
        <button type="button" className="btn-btea action-button" onClick={handleCreateOutlet}>Add outlet</button>
      </header>
      {notice && <div className="outlet-notice" role="status">{notice}</div>}

      <section className="workspace-card" aria-labelledby="outlet-list-title">
        <div className="workspace-card-header"><div><span className="page-eyebrow">Working copy</span><h2 id="outlet-list-title">Property outlets</h2></div><span className="count-badge">{outlets.length}</span></div>
        <div className="overflow-x-auto">
          <table className="portal-table">
            <caption className="sr-only">Outlets in the local property working copy</caption>
            <thead><tr><th>English name</th><th>Arabic name</th><th>Status</th><th>Type</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {outlets.length === 0 ? (
                <tr><td colSpan="5" className="table-empty">No outlets have been added. Create a working copy to begin.</td></tr>
              ) : outlets.map((outlet, index) => (
                <tr key={outlet.id || index}>
                  <td><strong>{outlet.name || 'Unnamed outlet'}</strong></td>
                  <td lang="ar" dir="rtl">{outlet.arabic_name || '—'}</td>
                  <td><span className="status-pill neutral">{outlet.status || 'Draft'}</span></td>
                  <td>{outlet.typestr || outlet.type || 'Not specified'}</td>
                  <td className="text-right"><button type="button" className="table-action" onClick={() => handleEditOutlet(outlet)}>Edit</button><button type="button" className="table-action danger" onClick={() => handleDeleteOutlet(outlet)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <a className="outlet-guide" target="_blank" rel="noreferrer" href="https://portal.btea.bh/eServices/Index/6"><FiHelpCircle aria-hidden="true" /><span><strong>Official Edit Outlet description</strong><small>Review the current BTEA source before production submission.</small></span><span aria-hidden="true">↗</span></a>

      {showOutletForm && <OutletForm mode={editMode} initialData={selectedOutlet} onSubmit={handleFormSubmit} onCancel={() => { setShowOutletForm(false); setSelectedOutlet(null); }} />}
    </div>
  );
};

export default Outlets;

