
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://zshotocsmvrgkcmofrks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaG90b2NzbXZyZ2tjbW9mcmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTA3NzEsImV4cCI6MjA2MTc2Njc3MX0.SQNHhHTv4Wg8BhxY0HUwGmvjDu0aL3r9U--v_hgGCZw',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);
