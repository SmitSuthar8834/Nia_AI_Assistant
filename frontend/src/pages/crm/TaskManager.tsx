import React, { useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import clsx from 'clsx';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date;
  assignedTo: string;
  relatedTo?: {
    type: 'lead' | 'contact' | 'deal';
    name: string;
  };
  createdAt: Date;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Follow up with TechCorp lead',
      description: 'Call John Smith to discuss proposal details',
      priority: 'high',
      status: 'pending',
      dueDate: new Date('2024-01-16T10:00:00'),
      assignedTo: 'Sarah Johnson',
      relatedTo: { type: 'lead', name: 'John Smith - TechCorp' },
      createdAt: new Date('2024-01-15T09:00:00'),
    },
    {
      id: '2',
      title: 'Prepare demo for Innovate Inc',
      description: 'Create customized demo showcasing key features',
      priority: 'medium',
      status: 'in_progress',
      dueDate: new Date('2024-01-17T14:00:00'),
      assignedTo: 'Mike Wilson',
      relatedTo: { type: 'lead', name: 'Emily Davis - Innovate Inc' },
      createdAt: new Date('2024-01-14T11:30:00'),
    },
    {
      id: '3',
      title: 'Send contract to Startup.io',
      description: 'Finalize and send signed contract',
      priority: 'high',
      status: 'completed',
      dueDate: new Date('2024-01-15T16:00:00'),
      assignedTo: 'Sarah Johnson',
      relatedTo: { type: 'deal', name: 'Startup.io Deal' },
      createdAt: new Date('2024-01-13T14:20:00'),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    const matchesStatus = !selectedStatus || task.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(option => option.value === priority);
    return priorityOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckIcon className="h-4 w-4 text-green-500" />;
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your tasks and follow-ups
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-red-600">
            {tasks.filter(t => t.status === 'pending' && isOverdue(t.dueDate)).length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="input-field"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600">
            {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getPriorityIcon(task.priority)}
                  <h3 className="text-lg font-medium text-gray-900">
                    {task.title}
                  </h3>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  {isOverdue(task.dueDate) && task.status !== 'completed' && (
                    <span className="text-red-600 font-medium">Overdue</span>
                  )}
                  <span>Assigned to: {task.assignedTo}</span>
                  {task.relatedTo && (
                    <span>Related to: {task.relatedTo.name}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className={clsx(
                    'text-xs font-medium rounded-full px-2.5 py-0.5 border-0',
                    getStatusColor(task.status)
                  )}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No tasks found matching your criteria</div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;