import { NavLink } from 'react-router-dom';
import { FiBriefcase, FiClipboard, FiFileText, FiGrid, FiHome } from 'react-icons/fi';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const tabs = [
  { to: '/', label: 'Home', icon: FiHome, end: true },
  { to: '/services', label: 'Services', icon: FiBriefcase },
  { to: '/applications', label: 'Cases', icon: FiFileText },
  { to: '/inspections', label: 'Inspections', icon: FiClipboard },
  { to: '/more', label: 'More', icon: FiGrid },
];

const tapFeedback = () => {
  if (Capacitor.isNativePlatform()) Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
};

const MobileTabBar = () => (
  <nav className="mobile-tabbar" aria-label="Mobile primary navigation">
    {tabs.map(({ to, label, icon: Icon, end }) => (
      <NavLink key={to} to={to} end={end} onClick={tapFeedback} className={({ isActive }) => isActive ? 'active' : ''}>
        <Icon aria-hidden="true" /><span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

export default MobileTabBar;
