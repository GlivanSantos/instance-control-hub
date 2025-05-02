
import { Instance, Client, InstanceMetrics } from '../types';

// Mock instances data
export const mockInstances: Instance[] = [
  {
    id: '1',
    name: 'prod-server-01',
    clientId: '2',
    clientName: 'Acme Corporation',
    status: 'running',
    type: 'Premium',
    cpu: 4,
    memory: 8,
    storage: 100,
    createdAt: '2024-04-15T10:30:00Z',
    lastUpdated: '2024-05-01T08:12:34Z',
    ipAddress: '192.168.1.100',
    region: 'us-east',
  },
  {
    id: '2',
    name: 'dev-server-02',
    clientId: '2',
    clientName: 'Acme Corporation',
    status: 'stopped',
    type: 'Standard',
    cpu: 2,
    memory: 4,
    storage: 50,
    createdAt: '2024-04-20T14:45:00Z',
    lastUpdated: '2024-04-30T19:22:11Z',
    ipAddress: '192.168.1.101',
    region: 'us-west',
  },
  {
    id: '3',
    name: 'test-server-01',
    clientId: '3',
    clientName: 'Globex Industries',
    status: 'running',
    type: 'Standard',
    cpu: 2,
    memory: 4,
    storage: 80,
    createdAt: '2024-04-18T09:15:00Z',
    lastUpdated: '2024-05-01T12:34:56Z',
    ipAddress: '192.168.1.102',
    region: 'eu-west',
  },
  {
    id: '4',
    name: 'prod-db-01',
    clientId: '3',
    clientName: 'Globex Industries',
    status: 'error',
    type: 'Premium',
    cpu: 8,
    memory: 16,
    storage: 500,
    createdAt: '2024-04-10T11:20:00Z',
    lastUpdated: '2024-05-01T01:45:22Z',
    ipAddress: '192.168.1.103',
    region: 'ap-south',
  },
  {
    id: '5',
    name: 'backup-server-01',
    clientId: '4',
    clientName: 'Initech LLC',
    status: 'running',
    type: 'Basic',
    cpu: 1,
    memory: 2,
    storage: 200,
    createdAt: '2024-04-22T16:40:00Z',
    lastUpdated: '2024-04-30T23:11:45Z',
    ipAddress: '192.168.1.104',
    region: 'us-central',
  },
  {
    id: '6',
    name: 'analytics-server-01',
    clientId: '5',
    clientName: 'Umbrella Corp',
    status: 'running',
    type: 'Premium',
    cpu: 16,
    memory: 32,
    storage: 1000,
    createdAt: '2024-04-05T08:50:00Z',
    lastUpdated: '2024-05-01T15:23:11Z',
    ipAddress: '192.168.1.105',
    region: 'eu-central',
  },
];

// Mock clients data
export const mockClients: Client[] = [
  {
    id: '2',
    name: 'Acme Corporation',
    email: 'contact@acmecorp.com',
    company: 'Acme Corporation',
    phone: '(555) 123-4567',
    instances: 2,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '3',
    name: 'Globex Industries',
    email: 'info@globex.com',
    company: 'Globex Industries',
    phone: '(555) 987-6543',
    instances: 2,
    status: 'active',
    createdAt: '2024-02-22T14:45:00Z',
  },
  {
    id: '4',
    name: 'Initech LLC',
    email: 'support@initech.com',
    company: 'Initech LLC',
    phone: '(555) 456-7890',
    instances: 1,
    status: 'inactive',
    createdAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '5',
    name: 'Umbrella Corp',
    email: 'contact@umbrella.com',
    company: 'Umbrella Corporation',
    phone: '(555) 789-0123',
    instances: 1,
    status: 'active',
    createdAt: '2024-03-28T11:20:00Z',
  },
];

// Generate random metrics data for instances
export const generateInstanceMetrics = (instanceId: string): InstanceMetrics => {
  // Generate 24 data points (hourly for a day)
  const dataPoints = 24;
  const now = new Date();
  const timestamps = Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date(now);
    date.setHours(now.getHours() - (dataPoints - i));
    return date.toISOString();
  });

  // Generate random metrics with some variance but trending around certain values
  const cpu = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 70) + 10);
  const memory = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 60) + 20);
  const storage = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 40) + 40);
  const network = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 80) + 5);

  return {
    cpu,
    memory,
    storage,
    network,
    timestamps,
  };
};

// Get client instances
export const getClientInstances = (clientId: string): Instance[] => {
  return mockInstances.filter(instance => instance.clientId === clientId);
};
