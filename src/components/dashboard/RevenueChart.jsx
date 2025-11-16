import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Card from '../ui/Card';
import { FiTrendingUp } from 'react-icons/fi';
import useThemeStore from '../../stores/themeStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ data = [] }) => {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Default mock data if no data provided
  const mockData = [
    { month: 'Jan', levy: 4000, renewals: 2400, applications: 2400 },
    { month: 'Feb', levy: 3000, renewals: 1398, applications: 2210 },
    { month: 'Mar', levy: 2000, renewals: 9800, applications: 2290 },
    { month: 'Apr', levy: 2780, renewals: 3908, applications: 2000 },
    { month: 'May', levy: 1890, renewals: 4800, applications: 2181 },
    { month: 'Jun', levy: 2390, renewals: 3800, applications: 2500 },
  ];

  const chartData = data.length > 0 ? data : mockData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#9ca3af' : '#4b5563',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f3f4f6' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: BD ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? '#374151' : '#f3f4f6',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          callback: function (value) {
            return 'BD ' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const chartDataset = {
    labels: chartData.map((d) => d.month),
    datasets: [
      {
        label: 'Levy Revenue',
        data: chartData.map((d) => d.levy),
        borderColor: '#815374',
        backgroundColor: 'rgba(129, 83, 116, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#815374',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Renewals',
        data: chartData.map((d) => d.renewals),
        borderColor: '#55d6be',
        backgroundColor: 'rgba(85, 214, 190, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#55d6be',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Applications',
        data: chartData.map((d) => d.applications),
        borderColor: '#f0bc74',
        backgroundColor: 'rgba(240, 188, 116, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f0bc74',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <Card
      title="Revenue Overview"
      subtitle="Monthly revenue trends"
      icon={FiTrendingUp}
    >
      <div className="h-80">
        <Line options={options} data={chartDataset} />
      </div>
    </Card>
  );
};

export default RevenueChart;
