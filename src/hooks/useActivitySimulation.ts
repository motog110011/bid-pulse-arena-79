
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useActivitySimulation() {
  const triggerActivity = useCallback(async () => {
    try {
      console.log('🎯 Triggering auction activity simulation...');
      
      // Call the activity simulator
      const { data: activityData, error: activityError } = await supabase.functions.invoke('auction-activity-simulator');
      
      if (activityError) {
        console.error('Error triggering activity simulation:', activityError);
      } else if (activityData?.activeBids > 0) {
        console.log(`🎉 Activity simulation: ${activityData.activeBids} new bids placed`);
      }

      // Also trigger auction rotation to renew ended auctions
      const { data: rotatorData, error: rotatorError } = await supabase.functions.invoke('auction-rotator');
      
      if (rotatorError) {
        console.error('Error triggering auction rotation:', rotatorError);
      } else if (rotatorData?.renewedCount > 0) {
        console.log(`🔄 Auction rotation: ${rotatorData.renewedCount} auctions renewed`);
      }
    } catch (error) {
      console.error('Error in activity/rotation simulation:', error);
    }
  }, []);

  const triggerRotation = useCallback(async () => {
    try {
      console.log('🔄 Triggering auction rotation...');
      const { data, error } = await supabase.functions.invoke('auction-rotator');
      
      if (error) {
        console.error('Error triggering rotation:', error);
      } else {
        console.log('✅ Rotation result:', data);
      }
    } catch (error) {
      console.error('Error in rotation:', error);
    }
  }, []);

  useEffect(() => {
    // Initial activity simulation after 10 seconds
    const initialTimeout = setTimeout(triggerActivity, 10000);

    // Then every 3-7 minutes for activity
    const activityInterval = setInterval(() => {
      const randomDelay = Math.random() * 240000 + 180000; // 3-7 minutes
      setTimeout(triggerActivity, randomDelay);
    }, 360000); // Check every 6 minutes

    // Rotation every 15 minutes
    const rotationInterval = setInterval(triggerRotation, 900000); // 15 minutes

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(activityInterval);
      clearInterval(rotationInterval);
    };
  }, [triggerActivity, triggerRotation]);

  return { triggerActivity, triggerRotation };
}
