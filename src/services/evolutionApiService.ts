
import { supabase } from "@/integrations/supabase/client";

// Interface for Evolution API response
interface EvolutionApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Default API settings
const DEFAULT_API_SETTINGS = {
  apiUrl: 'https://evo.devautomatizadores.com.br/manager', 
  apiKey: '19431797ce04903c5499b0a30008c627'
};

// Get system settings from database with fallback to defaults
const getApiSettings = async (): Promise<{ apiUrl: string; apiKey: string }> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('api_url, api_key')
      .maybeSingle();
    
    if (error || !data) {
      console.log('Using default API settings');
      return DEFAULT_API_SETTINGS;
    }
    
    return {
      apiUrl: data.api_url || DEFAULT_API_SETTINGS.apiUrl,
      apiKey: data.api_key || DEFAULT_API_SETTINGS.apiKey
    };
  } catch (err) {
    console.error('Error fetching API settings:', err);
    return DEFAULT_API_SETTINGS;
  }
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
    const { apiUrl, apiKey } = settings;
    
    // Ensure the URL is properly formatted
    let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    console.log(`Making ${method} request to: ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: createHeaders(apiKey),
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    console.log('API Response:', data);
    
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
