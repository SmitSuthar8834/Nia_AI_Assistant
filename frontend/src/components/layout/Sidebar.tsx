import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  MicrophoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  EnvelopeIcon,
  BellIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Voice Assistant',
    icon: MicrophoneIcon,
    children: [
      { name: 'Assistant', href: '/voice/assistant' },
      { name: 'History', href: '/voice/history' },
      { name: 'Settings', href: '/voice/settings' },
    ],
  },
  {
    name: 'CRM',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'Leads', href: '/crm/leads' },
      { name: 'Tasks', href: '/crm/tasks' },
      { name: 'Meetings', href: '/crm/meetings' },
      { name: 'Emails', href: '/crm/emails' },
    ],
  },
  {
    name: 'Admin',
    icon: WrenchScrewdriverIcon,
    children: [
      { name: 'Users', href: '/admin/users' },
      { name: 'Monitoring', href: '/admin/monitoring' },
      { name: 'CRM Config', href: '/admin/crm-config' },
      { name: 'Analytics', href: '/admin/analytics' },
    ],
    permission: 'admin',
  },
  {
    name: 'Settings',
    icon: CogIcon,
    children: [
      { name: 'Profile', href: '/settings/profile' },
      { name: 'Notifications', href: '/settings/notifications' },
      { name: 'Integrations', href: '/settings/integrations' },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <div className="text-xl font-bold text-primary-600">
          Nia AI
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  {!item.children ? (
                    <Link
                      to={item.href!}
                      className={clsx(
                        isActive(item.href!)
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={clsx(
                          isActive(item.href!)
                            ? 'text-primary-600'
                            : 'text-gray-400 group-hover:text-primary-600',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                        {item.name}
                      </div>
                      <ul role="list" className="mt-2 space-y-1">
                        {item.children.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.href}
                              className={clsx(
                                isActive(subItem.href)
                                  ? 'bg-primary-50 text-primary-600'
                                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                'group flex gap-x-3 rounded-md p-2 pl-8 text-sm leading-6 font-semibold'
                              )}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                  <SidebarContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;