
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstancesList from '@/components/dashboard/InstancesList';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';
import { mockInstances } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Instances = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Filter instances if client user
  const userInstances = isAdmin() 
    ? mockInstances 
    : mockInstances.filter(instance => instance.clientId === user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Instances</h1>
          {isAdmin() && (
            <Button onClick={() => navigate('/instances/new')}>
              <Server className="mr-2 h-4 w-4" />
              New Instance
            </Button>
          )}
        </div>
        
        {/* Instances List */}
        <InstancesList instances={userInstances} isAdmin={isAdmin()} />
      </div>
    </DashboardLayout>
  );
};

export default Instances;
