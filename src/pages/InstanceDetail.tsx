
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstanceChart from '@/components/dashboard/InstanceChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Instance, InstanceMetrics } from '@/types';
import { Database, Server, ArrowLeft, Play, Square, RefreshCw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchInstanceDetails, startInstance, stopInstance, restartInstance, fetchInstanceMetrics } from '@/services/evolutionApiService';

const InstanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [instance, setInstance] = useState<Instance | null>(null);
  const [metrics, setMetrics] = useState<InstanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch instance details
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        // Get instance from database
        const { data, error } = await supabase
          .from('instances')
          .select(`
            *,
            clients(id, name)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Format instance to match our type
        const formattedInstance: Instance = {
          id: data.id,
          name: data.name,
          clientId: data.client_id,
          clientName: data.clients.name,
          status: data.status,
          type: data.type,
          cpu: data.cpu,
          memory: data.memory,
          storage: data.storage,
          createdAt: data.created_at,
          lastUpdated: data.updated_at,
          ipAddress: data.ip_address || 'N/A',
          region: data.region
        };
        
        setInstance(formattedInstance);
        
        // Get metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('instance_metrics')
          .select('*')
          .eq('instance_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!metricsError && metricsData) {
          setMetrics({
            cpu: metricsData.cpu_usage,
            memory: metricsData.memory_usage,
            storage: metricsData.storage_usage,
            network: metricsData.network_usage,
            timestamps: metricsData.timestamps
          });
        } else {
          // If no metrics found, create empty metrics
          setMetrics({
            cpu: [0, 10, 20, 15, 25, 30, 35],
            memory: [0, 20, 40, 30, 50, 45, 60],
            storage: [10, 12, 15, 20, 25, 30, 35],
            network: [5, 10, 15, 20, 15, 10, 20],
            timestamps: Array(7).fill('').map((_, i) => new Date(Date.now() - (6 - i) * 3600000).toISOString())
          });
        }
      } catch (error) {
        console.error('Error fetching instance details:', error);
        toast.error('Failed to load instance details');
        navigate('/instances');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  // Handle instance actions
  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!instance || !id) return;
    
    setActionLoading(true);
    let response;
    
    try {
      switch (action) {
        case 'start':
          response = await startInstance(id);
          break;
        case 'stop':
          response = await stopInstance(id);
          break;
        case 'restart':
          response = await restartInstance(id);
          break;
      }
      
      if (response.success) {
        let newStatus: 'running' | 'stopped' | 'error';
        let message = '';
        
        switch (action) {
          case 'start':
            newStatus = 'running';
            message = 'Instance started successfully';
            break;
          case 'stop':
            newStatus = 'stopped';
            message = 'Instance stopped successfully';
            break;
          case 'restart':
            newStatus = 'running';
            message = 'Instance restarted successfully';
            break;
        }
        
        // Update instance status
        const { error } = await supabase
          .from('instances')
          .update({ status: newStatus })
          .eq('id', id);
        
        if (error) throw error;
        
        setInstance({ ...instance, status: newStatus });
        toast.success(message);
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error(`Error during ${action} operation:`, error);
      toast.error(`Failed to ${action} instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!instance) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Instance not found</h2>
          <Button 
            variant="link" 
            onClick={() => navigate('/instances')}
            className="mt-4"
          >
            Return to instances
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-success text-success-foreground';
      case 'stopped':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/instances')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{instance.name}</h1>
          <Badge className={cn("ml-2", getStatusColor(instance.status))}>
            {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            disabled={instance.status === 'running' || actionLoading} 
            onClick={() => handleAction('start')}
          >
            <Play className="h-4 w-4 mr-2" />
            Start
            {actionLoading && instance.status !== 'running' && 
              <div className="w-4 h-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            }
          </Button>
          <Button 
            disabled={instance.status === 'stopped' || actionLoading}
            variant="outline"
            onClick={() => handleAction('stop')}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
            {actionLoading && instance.status !== 'stopped' && 
              <div className="w-4 h-4 ml-2 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            }
          </Button>
          <Button 
            disabled={actionLoading}
            variant="outline"
            onClick={() => handleAction('restart')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
            {actionLoading && 
              <div className="w-4 h-4 ml-2 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            }
          </Button>
          <Button 
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        {/* Instance Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Instance Details</h2>
            <div className="bg-card p-4 rounded-lg border space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">ID</div>
                <div>{instance.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Client</div>
                <div>{instance.clientName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Instance Type</div>
                <div>{instance.type}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Region</div>
                <div>{instance.region}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">IP Address</div>
                <div>{instance.ipAddress}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Created</div>
                <div>{formatDate(instance.createdAt)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div>{formatDate(instance.lastUpdated)}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resource Configuration</h2>
            <div className="bg-card p-4 rounded-lg border space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">CPU</span>
                  <div className="flex items-center mt-2">
                    <Server className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-xl font-bold">{instance.cpu} vCPU</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">Memory</span>
                  <div className="flex items-center mt-2">
                    <Database className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-xl font-bold">{instance.memory} GB</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">Storage</span>
                  <div className="flex items-center mt-2">
                    <Database className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-xl font-bold">{instance.storage} GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Monitoring Graphs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Monitoring</h2>
          {metrics ? (
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
              <InstanceChart
                title="Storage Usage (%)"
                metrics={metrics}
                dataKey="storage"
                color="#7E69AB"
              />
              <InstanceChart
                title="Network Traffic (Mbps)"
                metrics={metrics}
                dataKey="network"
                color="#10B981"
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <p>No monitoring data available</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstanceDetail;
