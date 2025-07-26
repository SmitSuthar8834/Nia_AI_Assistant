import React, { useState, useEffect } from 'react';
import { Users, Database, Activity, Mic } from 'lucide-react';

interface DashboardStats {
  total_users: number;
  total_roles: number;
  total_permissions: number;
  total_tables: number;
  database_status: string;
  system_health: string;
}

interface StatItem {
  name: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/dashboard-stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatItems = (stats: DashboardStats): StatItem[] => [
    {
      name: 'Total Users',
      value: stats.total_users.toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Database Status',
      value: stats.database_status,
      icon: Database,
      color: 'bg-green-500',
    },
    {
      name: 'System Health',
      value: stats.system_health,
      icon: Activity,
      color: 'bg-emerald-500',
    },
    {
      name: 'Total Tables',
      value: stats.total_tables.toString(),
      icon: Mic,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.first_name} {user?.last_name}! ({user?.role})
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatItems(stats).map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Schema</h2>
          {stats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Tables</span>
                <span className="font-semibold text-gray-900">{stats.total_tables}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Roles</span>
                <span className="font-semibold text-gray-900">{stats.total_roles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Permissions</span>
                <span className="font-semibold text-gray-900">{stats.total_permissions}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {stats?.database_status || 'Connected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Redis Cache</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Server</span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Running
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};