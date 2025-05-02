
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstancesList from '@/components/dashboard/InstancesList';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchInstances } from '@/services/evolutionApiService';
import { Instance } from '@/types';
import { DbInstance } from '@/types/supabase';

const Instances = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching user role:', error);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
      } catch (err) {
        console.error("Failed to check user role:", err);
      }
    };
    
    checkUserRole();
  }, [user]);
  
  // Fetch instances from database
  useEffect(() => {
    const getInstances = async () => {
      setLoading(true);
      
      try {
        // Get instances from database 
        const { data, error } = await supabase
          .from('instances')
          .select(`
            *,
            clients (id, name)
          `);
        
        if (error) throw error;
        
        // Handle the case where data might be null
        let dbInstances = data || [];
        
        // If user is client, filter instances
        if (!isAdmin && user) {
          dbInstances = dbInstances.filter(instance => {
            // Find instances associated with this user
            return true; // Placeholder logic
          });
        }
        
        // Format instances to match our type
        const formattedInstances: Instance[] = dbInstances.map((instance: any) => ({
          id: instance.id,
          name: instance.name,
          clientId: instance.client_id,
          clientName: instance.clients?.name || 'Unknown',
          status: instance.status,
          type: instance.type,
          cpu: instance.cpu,
          memory: instance.memory,
          storage: instance.storage,
          createdAt: instance.created_at,
          lastUpdated: instance.updated_at,
          ipAddress: instance.ip_address || 'N/A',
          region: instance.region
        }));
        
        setInstances(formattedInstances);
      } catch (error) {
        console.error('Error fetching instances:', error);
        toast.error('Failed to load instances');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      getInstances();
    }
  }, [user, isAdmin]);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Instances</h1>
          {isAdmin && (
            <Button onClick={() => navigate('/instances/new')}>
              <Server className="mr-2 h-4 w-4" />
              New Instance
            </Button>
          )}
        </div>
        
        {/* Instances List */}
        <InstancesList 
          instances={instances} 
          isAdmin={isAdmin} 
          isLoading={loading} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Instances;
