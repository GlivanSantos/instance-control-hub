
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientsList from '@/components/dashboard/ClientsList';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { mockClients } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Clients</h1>
          <Button onClick={() => navigate('/clients/new')}>
            <Users className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
        
        {/* Clients List */}
        <ClientsList clients={mockClients} />
      </div>
    </DashboardLayout>
  );
};

export default Clients;
