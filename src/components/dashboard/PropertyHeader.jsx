import { FiDownload, FiEye, FiCalendar, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import clsx from 'clsx';

const PropertyHeader = ({ property }) => {
  if (!property) return null;
  const statusVariant = ({ Valid: 'success', Expired: 'error', Pending: 'warning' })[property.status] || 'default';

  return (
    <section className="glass-card overflow-hidden" aria-labelledby="property-title">
      <div className="grid gap-6 p-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <div>
          <img src={property.image || '/Content/images/hotelImages/genericBanner.png'} alt="" className="h-44 w-full rounded-xl border border-base-300 object-cover" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" icon={FiDownload} onClick={() => window.open(property.certificateUrl, '_blank', 'noopener,noreferrer')}>Certificate</Button>
            <Button variant="primary" size="sm" icon={FiEye} onClick={() => { window.location.href = `/Profile/showProfile/${property.id}`; }}>Full profile</Button>
          </div>
        </div>

        <div>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-base-300 pb-5">
            <div><span className="page-eyebrow">Selected property</span><h2 id="property-title" className="mt-1 flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-base-content">{property.name}<Badge variant={statusVariant}>{property.status}</Badge></h2><p className="mt-1 text-sm text-base-content/55">Commercial registration {property.cr}</p></div>
            <div className="property-expiry"><span>License expiry</span><strong>{formatDate(property.expiryDate)}</strong><small>{property.daysUntilExpiry} days remaining</small></div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Category" value={property.category} icon={<FiStar />} />
            <InfoRow label="First work date" value={formatDate(property.workDate)} icon={<FiCalendar />} />
            <InfoRow label="Issue date" value={formatDate(property.issueDate)} icon={<FiCalendar />} />
            <InfoRow label="Expiry date" value={formatDate(property.expiryDate)} icon={<FiCalendar />} highlight={isExpiringSoon(property.expiryDate)} />
          </dl>
        </div>
      </div>
    </section>
  );
};

const InfoRow = ({ label, value, icon, highlight = false }) => (
  <div className={clsx('property-info-row', highlight && 'warning')}>
    <dt><span aria-hidden="true">{icon}</span>{label}</dt><dd>{value}</dd>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  try { return format(new Date(dateString), 'dd MMM yyyy'); } catch { return dateString; }
};

const isExpiringSoon = (expiryDate) => expiryDate ? Math.floor((new Date(expiryDate) - new Date()) / 86400000) < 90 : false;

export default PropertyHeader;
