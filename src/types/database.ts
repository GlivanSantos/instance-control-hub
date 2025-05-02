
export type Tables = {
  clients: {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    phone: string | null;
    status: string;
    created_at: string;
  };
  instances: {
    id: string;
    name: string;
    client_id: string | null;
    status: string;
    type: string;
    cpu: number;
    memory: number;
    storage: number;
    ip_address: string | null;
    region: string;
    created_at: string;
    updated_at: string;
  };
  instance_metrics: {
    id: string;
    instance_id: string | null;
    cpu_usage: number[];
    memory_usage: number[];
    storage_usage: number[];
    network_usage: number[];
    timestamps: string[];
    created_at: string;
  };
  system_settings: {
    id: string;
    api_url: string;
    api_key: string;
    updated_at: string;
    updated_by: string | null;
  };
};
