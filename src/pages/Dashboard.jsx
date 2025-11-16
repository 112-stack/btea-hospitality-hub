import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiRepeat, FiFileText } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';

// Components
import PropertyHeader from '../components/dashboard/PropertyHeader';
import StatsCard from '../components/ui/StatsCard';
import RecentPayments from '../components/dashboard/RecentPayments';
import ApplicationsTable from '../components/dashboard/ApplicationsTable';
import RevenueChart from '../components/dashboard/RevenueChart';
import { SkeletonCard } from '../components/ui/Skeleton';

// Stores
import useDashboardStore from '../stores/dashboardStore';
import useAuthStore from '../stores/authStore';

const Dashboard = () => {
  const {
    propertyInfo,
    stats,
    recentPayments,
    applicationsInProgress,
    revenueData,
    isLoading,
    setPropertyInfo,
    setStats,
    setRecentPayments,
    setApplicationsInProgress,
    setRevenueData,
  } = useDashboardStore();

  const selectedProperty = useAuthStore((state) => state.selectedProperty);

  useEffect(() => {
    // Load dashboard data
    // In a real app, this would fetch from API
    loadDashboardData();
  }, [selectedProperty]);

  const loadDashboardData = () => {
    // Mock property data (would come from window.propertyData or API)
    const mockPropertyInfo = {
      id: '75dd54e4-bb1d-e711-993f-000c290e9127',
      name: 'TEST HOTEL',
      cr: '1120-1',
      category: '4 Stars Hotel',
      status: 'Valid',
      workDate: '2019-01-16',
      issueDate: '2024-04-09',
      expiryDate: '2027-07-08',
      daysUntilExpiry: 950,
      image: '/Content/images/hotelImages/genericBanner.png',
      certificateUrl: '/Renewal/downloadTourismCert/75dd54e4-bb1d-e711-993f-000c290e9127',
    };

    const mockStats = {
      levy: 16,
      renewals: 0,
      applications: 2,
    };

    const mockApplications = [
      {
        id: 'LVY-017015',
        type: '%5 Levy',
        status: 'In Progress',
        url: '/Levy/LvySummary',
      },
      {
        id: 'LVY-017014',
        type: '%5 Levy',
        status: 'In Progress',
        url: '/Levy/LvySummary',
      },
    ];

    setPropertyInfo(mockPropertyInfo);
    setStats(mockStats);
    setApplicationsInProgress(mockApplications);
    setRecentPayments([]); // No recent payments
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Toaster position="top-right" />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Tourism Property Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your property.
        </p>
      </motion.div>

      {/* Property Header */}
      <div className="mb-8">
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <PropertyHeader property={propertyInfo} />
        )}
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <StatsCard
          title="Levy Submissions"
          value={stats.levy}
          icon={FiCreditCard}
          gradient="secondary"
          link="/Levy/LvySummary"
          trend="up"
          trendValue="+12%"
          delay={0}
          sparklineData={[5, 10, 5, 20, 10, 12, 15, 18, 20, 16]}
        />

        <StatsCard
          title="Renewals"
          value={stats.renewals}
          icon={FiRepeat}
          gradient="accent"
          link="/Renewal/Summary"
          trend="neutral"
          trendValue="0%"
          delay={0.1}
          sparklineData={[10, 12, 8, 14, 12, 10, 8, 6, 4, 0]}
        />

        <StatsCard
          title="Applications"
          value={stats.applications}
          icon={FiFileText}
          gradient="purple"
          trend="up"
          trendValue="+2"
          delay={0.2}
          sparklineData={[1, 0, 1, 2, 1, 2, 1, 2, 3, 2]}
        />
      </motion.div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <RevenueChart data={revenueData} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Payments */}
        <div>
          <RecentPayments payments={recentPayments} loading={isLoading} />
        </div>

        {/* Quick Actions or Additional Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <QuickActionButton
              href="/Levy/LvySummary"
              icon="💳"
              title="Submit Levy"
              description="Submit your monthly levy report"
            />
            <QuickActionButton
              href="/Renewal/Summary"
              icon="🔄"
              title="Renew License"
              description="Renew your tourism license"
            />
            <QuickActionButton
              href="/RegularUpdate/ViewUpdates"
              icon="✏️"
              title="Update Property"
              description="Update property information"
            />
            <QuickActionButton
              href="/Profile/ShowProfile"
              icon="📋"
              title="View Profile"
              description="View complete property profile"
            />
          </div>
        </motion.div>
      </div>

      {/* Applications Table */}
      <div className="mb-8">
        <ApplicationsTable
          applications={applicationsInProgress}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

const QuickActionButton = ({ href, icon, title, description }) => (
  <a
    href={href}
    className="block p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md group"
  >
    <div className="flex items-center gap-3">
      <div className="text-3xl transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-btea-primary transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  </a>
);

export default Dashboard;
