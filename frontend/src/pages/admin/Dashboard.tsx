import React from 'react';
import {
  UsersIcon,
  MicrophoneIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  // Mock data for charts
  const voiceActivityData = [
    { name: 'Mon', interactions: 45 },
    { name: 'Tue', interactions: 52 },
    { name: 'Wed', interactions: 38 },
    { name: 'Thu', interactions: 61 },
    { name: 'Fri', interactions: 55 },
    { name: 'Sat', interactions: 28 },
    { name: 'Sun', interactions: 32 },
  ];

  const crmActivityData = [
    { name: 'Leads', count: 124 },
    { name: 'Tasks', count: 89 },
    { name: 'Meetings', count: 45 },
    { name: 'Emails', count: 67 },
  ];

  const stats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
    },
    {
      name: 'Voice Interactions',
      value: '8,456',
      change: '+18%',
      changeType: 'increase',
      icon: MicrophoneIcon,
    },
    {
      name: 'CRM Records',
      value: '2,345',
      change: '+8%',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'increase',
      icon: ChartBarIcon,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Created new lead',
      target: 'TechCorp Solutions',
      time: '2 minutes ago',
      type: 'success',
    },
    {
      id: 2,
      user: 'Sarah Smith',
      action: 'Scheduled meeting',
      target: 'Client Review',
      time: '5 minutes ago',
      type: 'info',
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'Updated task',
      target: 'Follow-up call',
      time: '10 minutes ago',
      type: 'warning',
    },
    {
      id: 4,
      user: 'Emily Davis',
      action: 'Voice interaction',
      target: 'Lead qualification',
      time: '15 minutes ago',
      type: 'success',
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'CRM sync delayed for Salesforce integration',
      time: '10 minutes ago',
    },
    {
      id: 2,
      type: 'info',
      message: 'System maintenance scheduled for tonight',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'error',
      message: 'Voice processing service experiencing high latency',
      time: '2 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening with your Nia AI Sales Assistant.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Activity Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Voice Interactions This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={voiceActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="interactions" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CRM Activity Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            CRM Activity Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={crmActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <button className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
            <BellIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className={`h-5 w-5 ${
                    alert.type === 'error' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <MicrophoneIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Voice Settings</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">CRM Config</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;