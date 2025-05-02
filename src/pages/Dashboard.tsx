
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusCard from '@/components/dashboard/StatusCard';
import InstancesList from '@/components/dashboard/InstancesList';
import InstanceChart from '@/components/dashboard/InstanceChart';
import { Button } from '@/components/ui/button';
import { Database, Server, Users, Activity } from 'lucide-react';
import { mockInstances, mockClients, generateInstanceMetrics } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [metrics] = useState(generateInstanceMetrics('overall'));
  
  // Filter instances if client user
  const userInstances = isAdmin() 
    ? mockInstances 
    : mockInstances.filter(instance => instance.clientId === user?.id);

  // Calculate dashboard statistics
  const totalInstances = userInstances.length;
  const runningInstances = userInstances.filter(i => i.status === 'running').length;
  const stoppedInstances = userInstances.filter(i => i.status === 'stopped').length;
  const instancesWithErrors = userInstances.filter(i => i.status === 'error').length;
  const clientsCount = isAdmin() ? mockClients.length : null;

  const avgCpuUsage = Math.round(metrics.cpu.reduce((sum, val) => sum + val, 0) / metrics.cpu.length);
  const avgMemoryUsage = Math.round(metrics.memory.reduce((sum, val) => sum + val, 0) / metrics.memory.length);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {isAdmin() && (
            <Button>
              <Server className="mr-2 h-4 w-4" />
              New Instance
            </Button>
          )}
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Total Instances"
            value={totalInstances}
            icon={<Server className="h-4 w-4" />}
            description="Across all regions"
          />
          <StatusCard
            title="Running"
            value={runningInstances}
            icon={<Activity className="h-4 w-4" />}
            description="Instances online"
            trend={{ value: 12, positive: true }}
          />
          {isAdmin() ? (
            <StatusCard
              title="Clients"
              value={clientsCount || 0}
              icon={<Users className="h-4 w-4" />}
              description="Total clients"
              trend={{ value: 5, positive: true }}
            />
          ) : (
            <StatusCard
              title="Stopped"
              value={stoppedInstances}
              icon={<Database className="h-4 w-4" />}
              description="Instances offline"
            />
          )}
          <StatusCard
            title="Issues"
            value={instancesWithErrors}
            icon={<Server className="h-4 w-4" />}
            description="Instances with errors"
            trend={{ value: 3, positive: false }}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InstanceChart
            title="CPU Usage (%)"
            metrics={metrics}
            dataKey="cpu"
            color="#8b5cf6"
          />
          <InstanceChart
            title="Memory Usage (%)"
            metrics={metrics}
            dataKey="memory"
            color="#1EAEDB"
          />
        </div>
        
        {/* Instances */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Instances</h2>
          <InstancesList instances={userInstances.slice(0, 5)} isAdmin={isAdmin()} />
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => window.location.href = '/instances'}>
              View All Instances
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
