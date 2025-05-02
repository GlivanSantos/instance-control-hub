
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InstanceChart from '@/components/dashboard/InstanceChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockInstances, generateInstanceMetrics } from '@/services/mockData';
import { Instance, InstanceMetrics } from '@/types';
import { Database, Server, ArrowLeft, Play, Square, RefreshCw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const InstanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [instance, setInstance] = useState<Instance | null>(null);
  const [metrics, setMetrics] = useState<InstanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Find instance by id
    const foundInstance = mockInstances.find(i => i.id === id);
    if (foundInstance) {
      setInstance(foundInstance);
      setMetrics(generateInstanceMetrics(id || ''));
    } else {
      navigate('/instances');
    }
  }, [id, navigate]);

  const handleAction = (action: 'start' | 'stop' | 'restart') => {
    if (!instance) return;
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let newStatus: 'running' | 'stopped' | 'error' = instance.status;
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
      
      setInstance({ ...instance, status: newStatus });
      toast.success(message);
      setLoading(false);
    }, 1500);
  };

  if (!instance || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            disabled={instance.status === 'running' || loading} 
            onClick={() => handleAction('start')}
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button 
            disabled={instance.status === 'stopped' || loading}
            variant="outline"
            onClick={() => handleAction('stop')}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
          <Button 
            disabled={loading}
            variant="outline"
            onClick={() => handleAction('restart')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstanceDetail;
