
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DbSystemSettings } from '@/types/supabase';

const Settings = () => {
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState('https://evo.devautomatizadores.com.br/manager');
  const [apiKey, setApiKey] = useState('19431797ce04903c5499b0a30008c627');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch existing API settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('api_url, api_key')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }
        
        if (data) {
          setApiUrl(data.api_url || 'https://evo.devautomatizadores.com.br/manager');
          // For security, don't show full API key if it's already set
          if (data.api_key) {
            setApiKey(data.api_key.replace(/^(.{4})(.*)(.{4})$/, '$1•••••••••••$3'));
          } else {
            setApiKey('19431797ce04903c5499b0a30008c627');
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleSaveApiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if we have existing settings
      const { data: existingData, error: existingError } = await supabase
        .from('system_settings')
        .select('id')
        .maybeSingle();
      
      if (existingError) {
        console.error('Error checking existing settings:', existingError);
      }
      
      // If apiKey contains bullets (•), it means user didn't change it, so don't update it
      const shouldUpdateKey = !apiKey.includes('•');
      
      if (existingData?.id) {
        // Update existing record
        const updateData: { api_url: string; api_key?: string; updated_by: string } = {
          api_url: apiUrl,
          updated_by: user?.id || ''
        };
        
        if (shouldUpdateKey) {
          updateData.api_key = apiKey;
        }
        
        const { error } = await supabase
          .from('system_settings')
          .update(updateData)
          .eq('id', existingData.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('system_settings')
          .insert({
            api_url: apiUrl,
            api_key: apiKey,
            updated_by: user?.id || ''
          });
        
        if (error) throw error;
      }
      
      toast.success('API configuration saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save API configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      // Get current settings either from form or database
      let testApiUrl = apiUrl;
      let testApiKey = apiKey;
      
      // If apiKey contains bullets (•), get the real key from database
      if (apiKey.includes('•')) {
        const { data, error } = await supabase
          .from('system_settings')
          .select('api_key')
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          testApiKey = data.api_key;
        }
      }
      
      // Test the API connection
      const response = await fetch(`${testApiUrl}/instances`, {
        headers: {
          'Authorization': `Bearer ${testApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      toast.success('Connection successful! API is responding correctly.');
    } catch (error) {
      console.error('Test connection error:', error);
      toast.error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <Tabs defaultValue="api">
          <TabsList>
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolution API Configuration</CardTitle>
                <CardDescription>
                  Configure the connection to the Evolution API for instance management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveApiSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-url">API URL</Label>
                    <Input
                      id="api-url"
                      placeholder="https://api.evolution.com/v1"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Your API key is stored securely and used to authenticate with the Evolution API.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Test Connection</CardTitle>
                <CardDescription>
                  Verify the connection to the Evolution API with your current settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={testLoading}
                >
                  {testLoading ? 'Testing...' : 'Test Connection'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications about your instances.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Notification settings configuration will be implemented in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security options for the instance management system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Security settings configuration will be implemented in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
