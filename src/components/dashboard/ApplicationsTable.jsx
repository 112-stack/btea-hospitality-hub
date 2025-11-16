import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiDownload, FiEye } from 'react-icons/fi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { format } from 'date-fns';
import clsx from 'clsx';

const ApplicationsTable = ({ applications = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const filtered Applications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || app.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [applications, searchTerm, filterType]);

  const sortedApplications = useMemo(() => {
    const sorted = [...filteredApplications];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredApplications, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusVariant = (status) => {
    const variants = {
      'In Progress': 'warning',
      'Completed': 'success',
      'Pending': 'info',
      'Rejected': 'error',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <Card title="Applications In Progress">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Applications In Progress"
      subtitle={`${sortedApplications.length} active applications`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={FiFilter}>
            Filter
          </Button>
          <Button variant="ghost" size="sm" icon={FiDownload}>
            Export
          </Button>
        </div>
      }
    >
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={clsx(
              "w-full pl-10 pr-4 py-2 rounded-lg border",
              "bg-white dark:bg-gray-800",
              "border-gray-300 dark:border-gray-600",
              "focus:ring-2 focus:ring-btea-primary focus:border-transparent",
              "transition-all duration-200"
            )}
          />
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={clsx(
            "px-4 py-2 rounded-lg border",
            "bg-white dark:bg-gray-800",
            "border-gray-300 dark:border-gray-600",
            "focus:ring-2 focus:ring-btea-primary focus:border-transparent"
          )}
        >
          <option value="all">All Types</option>
          <option value="%5 Levy">%5 Levy</option>
          <option value="Renewal">Renewal</option>
          <option value="License">License</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-btea-primary transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  ID
                  {sortConfig.key === 'id' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-btea-primary transition-colors"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  {sortConfig.key === 'type' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {sortedApplications.map((app, index) => (
              <motion.tr
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={app.url}
                    className="text-btea-primary hover:text-btea-primary-dark font-medium transition-colors"
                  >
                    {app.id}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {app.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(app.status)}>
                    {app.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiEye}
                    onClick={() => window.location.href = app.url}
                  >
                    View
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {sortedApplications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all'
                ? 'No applications found matching your criteria'
                : 'No applications in progress'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination would go here */}
    </Card>
  );
};

export default ApplicationsTable;
