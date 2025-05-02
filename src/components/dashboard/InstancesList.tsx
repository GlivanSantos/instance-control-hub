
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Instance } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface InstancesListProps {
  instances: Instance[];
  isAdmin?: boolean;
}

const InstancesList: React.FC<InstancesListProps> = ({ instances, isAdmin = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredInstances = instances.filter((instance) => {
    const matchesSearch = 
      instance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === null || instance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-success';
      case 'stopped':
        return 'bg-warning';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const handleViewInstance = (instanceId: string) => {
    navigate(`/instances/${instanceId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search instances..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('running')}>
              Running
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('stopped')}>
              Stopped
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('error')}>
              Error
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Name</TableHead>
              {isAdmin && <TableHead>Client</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="hidden md:table-cell">IP Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                  No instances found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInstances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", getStatusColor(instance.status))} />
                      <span className="capitalize">{instance.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{instance.name}</TableCell>
                  {isAdmin && <TableCell>{instance.clientName}</TableCell>}
                  <TableCell>
                    <Badge variant="outline">{instance.type}</Badge>
                  </TableCell>
                  <TableCell>{instance.region}</TableCell>
                  <TableCell className="hidden md:table-cell">{instance.ipAddress}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewInstance(instance.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InstancesList;
