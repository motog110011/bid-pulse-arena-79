import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useActivitySimulation() {
  const { toast } = useToast();

  const triggerActivity = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('auction-activity-simulator');
      
      if (error) {
        console.error('Error triggering activity simulation:', error);
        return;
      }

      if (data?.activeBids > 0) {
        console.log(`🎯 Activity simulation: ${data.activeBids} new bids placed`);
      }
    } catch (error) {
      console.error('Error in activity simulation:', error);
    }
  }, []);

  useEffect(() => {
    // Initial simulation after 10 seconds
    const initialTimeout = setTimeout(triggerActivity, 10000);

    // Then every 2-5 minutes
    const interval = setInterval(() => {
      const randomDelay = Math.random() * 180000 + 120000; // 2-5 minutes
      setTimeout(triggerActivity, randomDelay);
    }, 300000); // Check every 5 minutes

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [triggerActivity]);

  return { triggerActivity };
}