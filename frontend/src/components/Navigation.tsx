import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  Database, 
  BarChart3,
  Mic,
  LogOut,
  UserPlus,
  Shield
} from 'lucide-react';
import { NiaLogo } from './NiaLogo';
import { useTabManager } from './TabManager';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Voice Interface', href: '/voice', icon: Mic },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Database', href: '/database', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Nia Admin</h1>
        <p className="text-sm text-gray-600 mt-1">AI Sales Assistant</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="px-3">
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};