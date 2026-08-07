import {
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiGlobe,
  FiGrid,
  FiHome,
  FiLock,
  FiMapPin,
  FiMessageSquare,
  FiMusic,
  FiRefreshCw,
  FiRepeat,
  FiRotateCcw,
  FiShoppingBag,
  FiStar,
  FiUser,
} from 'react-icons/fi';

const icons = {
  artist: FiMusic,
  audit: FiFileText,
  classification: FiStar,
  closure: FiLock,
  complaint: FiMessageSquare,
  event: FiCalendar,
  guide: FiUser,
  inspection: FiClipboard,
  levy: FiCreditCard,
  outlet: FiMapPin,
  participation: FiGlobe,
  property: FiHome,
  renewal: FiRefreshCw,
  revive: FiRotateCcw,
  rooms: FiGrid,
  selfInspection: FiCheckSquare,
  shop: FiShoppingBag,
  statistics: FiBarChart2,
  violation: FiAlertTriangle,
  fallback: FiRepeat,
};

const ServiceIcon = ({ name, className = '' }) => {
  const Icon = icons[name] || icons.fallback;
  return <Icon className={className} aria-hidden="true" />;
};

export default ServiceIcon;

