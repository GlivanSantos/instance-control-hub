
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstancesList from '@/components/dashboard/InstancesList';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Instance } from '@/types';
import { toast } from 'sonner';

const Instances = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        let query = supabase.from('instances').select(`
          *,
          clients (name)
        `);
        
        // Filter instances if client user
        if (user && !isAdmin()) {
          query = query.eq('client_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Map data to Instance type
          const mappedInstances: Instance[] = data.map(item => ({
            id: item.id,
            name: item.name,
            clientId: item.client_id || '',
            clientName: item.clients?.name || 'Unknown Client',
            status: item.status as 'running' | 'stopped' | 'error',
            type: item.type,
            cpu: item.cpu,
            memory: item.memory,
            storage: item.storage,
            createdAt: item.created_at,
            lastUpdated: item.updated_at,
            ipAddress: item.ip_address || '',
            region: item.region
          }));
          
          setInstances(mappedInstances);
        }
      } catch (error) {
        console.error('Error fetching instances:', error);
        toast.error('Failed to load instances');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstances();
  }, [user, isAdmin]);

  const handleCreateInstance = () => {
    navigate('/instances/new');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Instances</h1>
          {isAdmin() && (
            <Button onClick={handleCreateInstance}>
              <Server className="mr-2 h-4 w-4" />
              New Instance
            </Button>
          )}
        </div>
        
        {/* Instances List */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <InstancesList instances={instances} isAdmin={isAdmin()} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Instances;
