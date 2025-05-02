
export type DbInstance = {
  id: string;
  name: string;
  client_id: string;
  status: 'running' | 'stopped' | 'error';
  type: string;
  cpu: number;
  memory: number;
  storage: number;
  ip_address: string | null;
  region: string;
  created_at: string;
  updated_at: string;
  clients: {
    id: string;
    name: string;
  };
}

export type DbInstanceMetrics = {
  id: string;
  instance_id: string;
  cpu_usage: number[];
  memory_usage: number[];
  storage_usage: number[];
  network_usage: number[];
  timestamps: string[];
  created_at: string;
}

export type DbSystemSettings = {
  id: string;
  api_url: string;
  api_key: string;
  updated_at: string;
  updated_by: string | null;
}
