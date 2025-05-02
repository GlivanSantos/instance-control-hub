
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

export interface Instance {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: 'running' | 'stopped' | 'error';
  type: string;
  cpu: number;
  memory: number;
  storage: number;
  createdAt: string;
  lastUpdated: string;
  ipAddress: string;
  region: string;
}

export interface ApiConfiguration {
  url: string;
  apiKey: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  instances: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface InstanceMetrics {
  cpu: number[];
  memory: number[];
  storage: number[];
  network: number[];
  timestamps: string[];
}
