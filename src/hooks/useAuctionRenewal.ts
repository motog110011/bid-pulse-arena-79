import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuctionRenewalConfig {
  minExtensionMinutes: number; // Minimum extension time in minutes
  maxExtensionMinutes: number; // Maximum extension time in minutes
  checkIntervalSeconds: number; // How often to check for expired auctions
  enabled: boolean; // Enable/disable the renewal system
}

const DEFAULT_CONFIG: AuctionRenewalConfig = {
  minExtensionMinutes: 15,
  maxExtensionMinutes: 60,
  checkIntervalSeconds: 30,
  enabled: true
};

export function useAuctionRenewal(config: Partial<AuctionRenewalConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { toast } = useToast();

  const getRandomExtensionTime = useCallback((min: number, max: number) => {
    const randomMinutes = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomMinutes * 60 * 1000; // Convert to milliseconds
  }, []);

  const renewExpiredAuctions = useCallback(async () => {
    if (!finalConfig.enabled) return;

    try {
      // Get all active auctions that have expired
      const { data: expiredAuctions, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .lt('end_time', new Date().toISOString());

      if (error) {
        console.error('Auction renewal error:', error);
        return;
      }

      if (!expiredAuctions || expiredAuctions.length === 0) {
        return; // Silent when no expired auctions
      }

      console.log(`Auto-extending ${expiredAuctions.length} expired auction(s)`);

      // Renew each expired auction
      for (const auction of expiredAuctions) {
        const extensionTime = getRandomExtensionTime(
          finalConfig.minExtensionMinutes,
          finalConfig.maxExtensionMinutes
        );
        
        const newEndTime = new Date(Date.now() + extensionTime);
        
        console.log(`⏰ Extending auction "${auction.title}" by ${Math.round(extensionTime / (1000 * 60))} minutes`);

        const { error: updateError } = await supabase
          .from('auctions')
          .update({
            end_time: newEndTime.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', auction.id);

        if (updateError) {
          console.error(`❌ Failed to renew auction ${auction.id}:`, updateError);
        } else {
          console.log(`✅ Successfully renewed auction: ${auction.title}`);
          
          // Renewal is done silently in the background - no user notification
        }
      }

    } catch (error) {
      console.error('❌ Error in auction renewal process:', error);
    }
  }, [finalConfig.enabled, finalConfig.minExtensionMinutes, finalConfig.maxExtensionMinutes, getRandomExtensionTime]);

  const manualRenewalCheck = useCallback(async () => {
    console.log('🔧 Manual renewal check triggered');
    await renewExpiredAuctions();
  }, [renewExpiredAuctions]);

  // Set up automatic checking interval
  useEffect(() => {
    if (!finalConfig.enabled) {
      console.log('⏸️ Auction renewal system is disabled');
      return;
    }

    console.log(`🚀 Starting auction renewal system (checking every ${finalConfig.checkIntervalSeconds}s)`);
    
    // Create a stable function that doesn't change on every render
    const checkAuctions = async () => {
      if (!finalConfig.enabled) return;

      try {
        // Get all active auctions that have expired
        const { data: expiredAuctions, error } = await supabase
          .from('auctions')
          .select('*')
          .eq('status', 'active')
          .lt('end_time', new Date().toISOString());

        if (error) {
          console.error('Auction renewal error:', error);
          return;
        }

        if (!expiredAuctions || expiredAuctions.length === 0) {
          return; // Silent when no expired auctions
        }

        console.log(`Auto-extending ${expiredAuctions.length} expired auction(s)`);

        // Renew each expired auction
        for (const auction of expiredAuctions) {
          const randomMinutes = Math.floor(Math.random() * (finalConfig.maxExtensionMinutes - finalConfig.minExtensionMinutes + 1)) + finalConfig.minExtensionMinutes;
          const extensionTime = randomMinutes * 60 * 1000;
          
          const newEndTime = new Date(Date.now() + extensionTime);
          
          console.log(`⏰ Extending auction "${auction.title}" by ${Math.round(extensionTime / (1000 * 60))} minutes`);

          const { error: updateError } = await supabase
            .from('auctions')
            .update({
              end_time: newEndTime.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', auction.id);

          if (updateError) {
            console.error(`❌ Failed to renew auction ${auction.id}:`, updateError);
          } else {
            console.log(`✅ Successfully renewed auction: ${auction.title}`);
          }
        }

      } catch (error) {
        console.error('❌ Error in auction renewal process:', error);
      }
    };
    
    // Initial check
    checkAuctions();

    // Set up interval for periodic checks
    const interval = setInterval(checkAuctions, finalConfig.checkIntervalSeconds * 1000);

    return () => {
      console.log('🛑 Stopping auction renewal system');
      clearInterval(interval);
    };
  }, [finalConfig.enabled, finalConfig.checkIntervalSeconds, finalConfig.minExtensionMinutes, finalConfig.maxExtensionMinutes]);

  return {
    renewExpiredAuctions: manualRenewalCheck,
    config: finalConfig
  };
}
