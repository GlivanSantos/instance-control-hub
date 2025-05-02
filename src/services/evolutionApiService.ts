
import { supabase } from "@/integrations/supabase/client";

// Interface for Evolution API response
interface EvolutionApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Get system settings from database
const getApiSettings = async (): Promise<{ apiUrl: string; apiKey: string } | null> => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('api_url, api_key')
    .single();
  
  if (error) {
    console.error('Error fetching API settings:', error);
    return null;
  }
  
  return {
    apiUrl: data.api_url,
    apiKey: data.api_key
  };
};

// Create headers with API key
const createHeaders = (apiKey: string) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
};

// Base request function
const apiRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<EvolutionApiResponse> => {
  try {
    const settings = await getApiSettings();
    
    if (!settings) {
      return { 
        success: false, 
        message: 'API settings not configured. Please check your settings.' 
      };
    }
    
    const { apiUrl, apiKey } = settings;
    const url = `${apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: createHeaders(apiKey),
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Error: ${response.statusText}`,
        data
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('API Request error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

// Instance API functions
export const fetchInstances = async () => {
  return apiRequest('/instances');
};

export const fetchInstanceDetails = async (instanceId: string) => {
  return apiRequest(`/instances/${instanceId}`);
};

export const startInstance = async (instanceId: string) => {
  return apiRequest(`/instances/${instanceId}/start`, 'POST');
};

export const stopInstance = async (instanceId: string) => {
  return apiRequest(`/instances/${instanceId}/stop`, 'POST');
};

export const restartInstance = async (instanceId: string) => {
  return apiRequest(`/instances/${instanceId}/restart`, 'POST');
};

export const fetchInstanceMetrics = async (instanceId: string) => {
  return apiRequest(`/instances/${instanceId}/metrics`);
};
