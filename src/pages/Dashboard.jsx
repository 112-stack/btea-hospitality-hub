import { useEffect } from 'react';
import { FiCreditCard, FiRepeat, FiFileText, FiEdit3, FiUser } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';
import PropertyHeader from '../components/dashboard/PropertyHeader';
import StatsCard from '../components/ui/StatsCard';
import RecentPayments from '../components/dashboard/RecentPayments';
import ApplicationsTable from '../components/dashboard/ApplicationsTable';
import RevenueChart from '../components/dashboard/RevenueChart';
import { SkeletonCard } from '../components/ui/Skeleton';
import useDashboardStore from '../stores/dashboardStore';
import useAuthStore from '../stores/authStore';

const Dashboard = () => {
  const { propertyInfo, stats, recentPayments, applicationsInProgress, revenueData, isLoading, setPropertyInfo, setStats, setRecentPayments, setApplicationsInProgress, setRevenueData } = useDashboardStore();
  const selectedProperty = useAuthStore((state) => state.selectedProperty);

  useEffect(() => {
    setPropertyInfo({
      id: '75dd54e4-bb1d-e711-993f-000c290e9127', name: 'TEST HOTEL', cr: '1120-1', category: '4 Stars Hotel', status: 'Valid',
      workDate: '2019-01-16', issueDate: '2024-04-09', expiryDate: '2027-07-08', daysUntilExpiry: 950,
      image: '/property-placeholder.svg', certificateUrl: '/Renewal/downloadTourismCert/75dd54e4-bb1d-e711-993f-000c290e9127',
    });
    setStats({ levy: 16, renewals: 1, applications: 3 });
    setApplicationsInProgress([
      { id: 'BTEA-26-1042', type: 'Tourism Levy', status: 'Action required', url: '#/applications/BTEA-26-1042' },
      { id: 'BTEA-26-1038', type: 'License Renewal', status: 'Under review', url: '#/applications/BTEA-26-1038' },
      { id: 'BTEA-26-1027', type: 'Artist Permission', status: 'Draft', url: '#/applications/BTEA-26-1027' },
    ]);
    setRecentPayments([
      { id: 'PAY-1042', amount: 1840, date: '2026-08-02', status: 'Completed', type: 'Tourism levy' },
      { id: 'PAY-1038', amount: 1260, date: '2026-07-18', status: 'Completed', type: 'License renewal' },
    ]);
    setRevenueData([
      { month: 'Jan', levy: 18400, renewals: 4200, applications: 3100 }, { month: 'Feb', levy: 22100, renewals: 5100, applications: 3900 },
      { month: 'Mar', levy: 20750, renewals: 4700, applications: 4200 }, { month: 'Apr', levy: 26800, renewals: 6200, applications: 4800 },
      { month: 'May', levy: 29400, renewals: 6800, applications: 5300 }, { month: 'Jun', levy: 32150, renewals: 7500, applications: 6100 },
    ]);
  }, [selectedProperty, setApplicationsInProgress, setPropertyInfo, setRecentPayments, setRevenueData, setStats]);

  return (
    <div>
      <Toaster position="top-right" />
      <header className="mb-7">
        <span className="page-eyebrow">Property library</span>
        <h1 className="mb-1 text-4xl font-bold tracking-tight text-base-content">Overview</h1>
        <p className="text-base-content/60">License health, levy activity, applications, and payments for the selected property.</p>
      </header>

      <div className="mb-6">{isLoading ? <SkeletonCard /> : <PropertyHeader property={propertyInfo} />}</div>
      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Property summary">
        <StatsCard title="Levy submissions" value={stats.levy} icon={FiCreditCard} gradient="secondary" link="#/services/2" trend="up" trendValue="12%" sparklineData={[5,10,5,20,10,12,15,18,20,16]} />
        <StatsCard title="Renewals" value={stats.renewals} icon={FiRepeat} gradient="accent" link="#/services/1" trend="up" trendValue="1 active" sparklineData={[10,12,8,14,12,10,8,6,4,1]} />
        <StatsCard title="Applications" value={stats.applications} icon={FiFileText} gradient="purple" link="#/applications" trend="up" trendValue="1 action" sparklineData={[1,0,1,2,1,2,1,2,3,3]} />
      </section>
      <div className="mb-6"><RevenueChart data={revenueData} /></div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPayments payments={recentPayments} loading={isLoading} />
        <section className="glass-card p-6" aria-labelledby="quick-actions-title">
          <div className="mb-4"><span className="page-eyebrow">Common tasks</span><h2 id="quick-actions-title" className="text-xl font-bold">Quick actions</h2></div>
          <div className="space-y-2">
            <QuickActionButton href="#/services/2" icon={FiCreditCard} title="Submit levy" description="Prepare the quarterly tourism levy workflow" />
            <QuickActionButton href="#/services/1" icon={FiRepeat} title="Renew license" description="Review renewal requirements and start a draft" />
            <QuickActionButton href="#/services/7" icon={FiEdit3} title="Update property" description="Prepare owner and manager record changes" />
            <QuickActionButton href="#/applications" icon={FiUser} title="Track applications" description="Review progress, evidence, and required actions" />
          </div>
        </section>
      </div>
      <ApplicationsTable applications={applicationsInProgress} loading={isLoading} />
    </div>
  );
};

const QuickActionButton = ({ href, icon: Icon, title, description }) => (
  <a href={href} className="quick-action group">
    <span className="quick-action-icon"><Icon aria-hidden="true" /></span>
    <span><strong>{title}</strong><small>{description}</small></span>
    <span className="ml-auto text-base-content/40" aria-hidden="true">›</span>
  </a>
);

export default Dashboard;
