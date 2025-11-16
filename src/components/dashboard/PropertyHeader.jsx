import { motion } from 'framer-motion';
import { FiDownload, FiEye, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import clsx from 'clsx';

const PropertyHeader = ({ property }) => {
  if (!property) return null;

  const getStatusVariant = (status) => {
    const statusMap = {
      'Valid': 'success',
      'Expired': 'error',
      'Pending': 'warning',
    };
    return statusMap[status] || 'default';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden"
    >
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23815374' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}/>
        </div>

        <div className="relative p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Property Image */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="col-span-1"
            >
              <div className="relative rounded-xl overflow-hidden shadow-lg group">
                <img
                  src={property.image || '/Content/images/hotelImages/genericBanner.png'}
                  alt={property.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiDownload}
                  onClick={() => window.open(property.certificateUrl, '_blank')}
                >
                  Certificate
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={FiEye}
                  onClick={() => window.location.href = `/Profile/showProfile/${property.id}`}
                >
                  Full Profile
                </Button>
              </div>
            </motion.div>

            {/* Property Details */}
            <div className="col-span-2 grid md:grid-cols-2 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    {property.name}
                    <Badge variant={getStatusVariant(property.status)}>
                      {property.status}
                    </Badge>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    CR: {property.cr}
                  </p>
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Category"
                    value={property.category}
                    icon="⭐"
                  />
                  <InfoRow
                    label="Work Date"
                    value={formatDate(property.workDate)}
                    icon={<FiCalendar className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-3">
                <InfoRow
                  label="Issue Date"
                  value={formatDate(property.issueDate)}
                  icon={<FiCalendar className="w-4 h-4" />}
                />
                <InfoRow
                  label="Expiry Date"
                  value={formatDate(property.expiryDate)}
                  icon={<FiCalendar className="w-4 h-4" />}
                  highlight={isExpiringSoon(property.expiryDate)}
                />

                {/* Days Until Expiry */}
                {property.daysUntilExpiry && (
                  <div className={clsx(
                    "p-3 rounded-lg border-l-4",
                    property.daysUntilExpiry < 30
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : property.daysUntilExpiry < 90
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-green-500 bg-green-50 dark:bg-green-900/20"
                  )}>
                    <p className="text-sm font-medium">
                      {property.daysUntilExpiry} days until expiry
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoRow = ({ label, value, icon, highlight = false }) => (
  <div className={clsx(
    "flex items-center justify-between p-3 rounded-lg transition-colors",
    highlight
      ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
      : "bg-gray-50 dark:bg-gray-800/50"
  )}>
    <div className="flex items-center gap-2">
      {typeof icon === 'string' ? (
        <span className="text-lg">{icon}</span>
      ) : (
        icon
      )}
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}:
      </span>
    </div>
    <span className={clsx(
      "font-semibold",
      highlight ? "text-yellow-700 dark:text-yellow-400" : "text-gray-900 dark:text-white"
    )}>
      {value}
    </span>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd-MM-yyyy');
  } catch {
    return dateString;
  }
};

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return days < 90;
};

export default PropertyHeader;
