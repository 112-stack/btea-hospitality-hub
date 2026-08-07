import { useMemo, useState } from 'react';
import { FiSearch, FiDownload, FiEye } from 'react-icons/fi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const ApplicationsTable = ({ applications = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const sortedApplications = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const filtered = applications.filter(app => (app.id?.toLowerCase().includes(query) || app.type?.toLowerCase().includes(query)) && (filterType === 'all' || app.type === filterType));
    return filtered.sort((left,right) => {
      const result = String(left[sortConfig.key] || '').localeCompare(String(right[sortConfig.key] || ''));
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [applications, filterType, searchTerm, sortConfig]);

  const handleSort = key => setSortConfig(previous => ({ key, direction: previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc' }));
  const exportRows = () => {
    const rows = [['ID','Type','Status'], ...sortedApplications.map(item => [item.id,item.type,item.status])];
    const csv = rows.map(row => row.map(value => `"${String(value || '').replaceAll('"','""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'applications.csv'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const variants = { 'In Progress': 'warning', Completed: 'success', Pending: 'info', Rejected: 'error' };

  if (loading) return <Card title="Applications in progress"><div className="space-y-3">{[0,1,2].map(item => <div key={item} className="h-16 animate-pulse rounded-lg bg-base-300" />)}</div></Card>;

  return (
    <Card title="Applications in progress" subtitle={`${sortedApplications.length} active applications`} actions={<Button variant="ghost" size="sm" icon={FiDownload} onClick={exportRows} disabled={!sortedApplications.length}>Export CSV</Button>}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search applications</span><FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" /><input type="search" placeholder="Search applications" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="application-control pl-9" /></label>
        <label><span className="sr-only">Filter by application type</span><select value={filterType} onChange={event => setFilterType(event.target.value)} className="application-control"><option value="all">All types</option><option value="%5 Levy">%5 Levy</option><option value="Renewal">Renewal</option><option value="License">License</option></select></label>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead><tr><SortableHeader label="ID" field="id" sortConfig={sortConfig} onSort={handleSort} /><SortableHeader label="Type" field="type" sortConfig={sortConfig} onSort={handleSort} /><th className="px-5 py-3 text-left text-xs font-semibold text-base-content/50">Status</th><th className="px-5 py-3 text-right text-xs font-semibold text-base-content/50">Action</th></tr></thead>
          <tbody className="divide-y divide-base-300">{sortedApplications.map(app => <tr key={app.id} className="hover:bg-base-200/60"><td className="px-5 py-4"><a href={app.url} className="font-semibold text-btea-primary">{app.id}</a></td><td className="px-5 py-4 text-sm">{app.type}</td><td className="px-5 py-4"><Badge variant={variants[app.status] || 'default'}>{app.status}</Badge></td><td className="px-5 py-4 text-right"><Button variant="ghost" size="sm" icon={FiEye} onClick={() => { window.location.href = app.url; }}>View</Button></td></tr>)}</tbody>
        </table>
        {!sortedApplications.length && <div className="py-10 text-center text-base-content/50">{searchTerm || filterType !== 'all' ? 'No applications match these filters.' : 'No applications are currently in progress.'}</div>}
      </div>
    </Card>
  );
};

const SortableHeader = ({ label, field, sortConfig, onSort }) => <th className="px-5 py-3 text-left"><button type="button" className="inline-flex min-h-8 items-center gap-1 rounded-md px-1 text-xs font-semibold text-base-content/50 hover:text-btea-primary" onClick={() => onSort(field)}>{label}{sortConfig.key === field && <span aria-label={sortConfig.direction === 'asc' ? 'ascending' : 'descending'}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}</button></th>;
export default ApplicationsTable;
