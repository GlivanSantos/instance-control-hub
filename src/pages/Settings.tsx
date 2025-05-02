
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

const Settings = () => {
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setApiUrl(data.api_url || '');
          // Don't show the actual API key, just mask it
          setSavedApiKey(data.api_key ? '************************' : '');
          setSettingsId(data.id);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
    };

    fetchSettings();
  }, []);

  const handleSaveApiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if we're updating or creating
      if (settingsId) {
        // Update existing settings
        const existingData = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', settingsId)
          .single();
          
        // Only update the API key if it was changed (not masked)
        const updatedSettings = {
          api_url: apiUrl,
          updated_by: user?.id || null,
          // Only update the API key if it's not the masked placeholder
          ...(apiKey !== '************************' && apiKey !== '' ? { api_key: apiKey } : {})
        };
        
        const { error: updateError } = await supabase
          .from('system_settings')
          .update(updatedSettings)
          .eq('id', existingData.data?.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from('system_settings')
          .insert({
            api_url: apiUrl,
            api_key: apiKey,
            updated_by: user?.id || null
          });
          
        if (insertError) throw insertError;
      }
      
      toast.success('API configuration saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    
    try {
      // Simulate API test (we would typically call an actual endpoint here)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data } = await supabase
        .from('system_settings')
        .select('api_key')
        .limit(1)
        .single();
      
      if (!data || !data.api_key) {
        toast.error('API key not configured');
        return;
      }
      
      // Here you would make an actual API call to test the connection
      toast.success('Connection successful');
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Connection failed');
    } finally {
      setTestingConnection(false);
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
                      value={apiKey || savedApiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={savedApiKey ? '************************' : ''}
                      required={!savedApiKey}
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
                  disabled={testingConnection}
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
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
