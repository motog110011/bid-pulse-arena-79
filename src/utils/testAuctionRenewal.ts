import { supabase } from '@/integrations/supabase/client';

/**
 * Test utilities for auction renewal system
 * Use these functions to manually test the renewal functionality
 */

/**
 * Creates a test auction that expires in a few seconds for testing
 */
export const createTestExpiredAuction = async (expiresInSeconds: number = 5) => {
  const expireTime = new Date(Date.now() + expiresInSeconds * 1000);
  
  const testAuction = {
    title: 'TEST - Subasta de Prueba (Auto-Renovación)',
    description: 'Subasta creada para probar el sistema de renovación automática',
    category: 'Perfumes',
    minimum_bid: 10.00,
    bid_increment: 1.00,
    current_bid: 10.00,
    end_time: expireTime.toISOString(),
    status: 'active',
    image_url: '/src/assets/product-perfume.jpg',
    total_bids: 0
  };

  try {
    const { data, error } = await supabase
      .from('auctions')
      .insert(testAuction)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating test auction:', error);
      return null;
    }

    console.log(`✅ Test auction created! Will expire in ${expiresInSeconds} seconds:`, data);
    console.log(`🔗 Auction ID: ${data.id}`);
    console.log(`⏰ Expires at: ${expireTime.toLocaleString()}`);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to create test auction:', error);
    return null;
  }
};

/**
 * Gets all expired auctions that are still active (should be auto-renewed)
 */
export const getExpiredActiveAuctions = async () => {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .lt('end_time', new Date().toISOString());

    if (error) {
      console.error('❌ Error fetching expired auctions:', error);
      return [];
    }

    console.log(`🎯 Found ${data.length} expired active auctions:`);
    data.forEach(auction => {
      const timeExpired = Date.now() - new Date(auction.end_time).getTime();
      console.log(`  - "${auction.title}" (expired ${Math.round(timeExpired/1000)}s ago)`);
    });

    return data;
  } catch (error) {
    console.error('❌ Failed to get expired auctions:', error);
    return [];
  }
};

/**
 * Removes test auctions (cleanup)
 */
export const cleanupTestAuctions = async () => {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .delete()
      .ilike('title', 'TEST%')
      .select();

    if (error) {
      console.error('❌ Error cleaning up test auctions:', error);
      return 0;
    }

    console.log(`🧹 Cleaned up ${data.length} test auctions`);
    return data.length;
  } catch (error) {
    console.error('❌ Failed to cleanup test auctions:', error);
    return 0;
  }
};

/**
 * Monitor an auction's status over time
 */
export const monitorAuction = (auctionId: string, duration: number = 120) => {
  console.log(`👀 Monitoring auction ${auctionId} for ${duration} seconds...`);
  
  let count = 0;
  const interval = setInterval(async () => {
    count++;
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('title, end_time, status, updated_at')
        .eq('id', auctionId)
        .single();

      if (error || !data) {
        console.log(`❌ Auction not found or error: ${error?.message}`);
        clearInterval(interval);
        return;
      }

      const endTime = new Date(data.end_time);
      const now = new Date();
      const timeRemaining = endTime.getTime() - now.getTime();
      const updatedAt = new Date(data.updated_at);

      console.log(`📊 Check ${count}: "${data.title}"`);
      console.log(`   Status: ${data.status}`);
      console.log(`   End time: ${endTime.toLocaleString()}`);
      console.log(`   Time remaining: ${timeRemaining > 0 ? Math.round(timeRemaining/1000) + 's' : 'EXPIRED'}`);
      console.log(`   Last updated: ${updatedAt.toLocaleString()}`);
      console.log('   ---');

    } catch (err) {
      console.error('❌ Error monitoring auction:', err);
    }

    if (count >= duration / 5) { // Check every 5 seconds
      clearInterval(interval);
      console.log('⏹️ Monitoring stopped');
    }
  }, 5000);

  // Return a cleanup function
  return () => {
    clearInterval(interval);
    console.log('⏹️ Monitoring stopped manually');
  };
};

/**
 * Complete test workflow
 */
export const runRenewalTest = async () => {
  console.log('🚀 Starting auction renewal test...');
  
  // Step 1: Clean up any existing test auctions
  await cleanupTestAuctions();
  
  // Step 2: Create a test auction that expires quickly
  const testAuction = await createTestExpiredAuction(10); // 10 seconds
  
  if (!testAuction) {
    console.log('❌ Failed to create test auction');
    return;
  }
  
  // Step 3: Monitor the auction
  const stopMonitoring = monitorAuction(testAuction.id, 120); // Monitor for 2 minutes
  
  console.log('📝 Test Instructions:');
  console.log('1. The auction will expire in 10 seconds');
  console.log('2. The renewal system should automatically extend it within 30 seconds');
  console.log('3. You should see a toast notification when it\'s renewed');
  console.log('4. Check the console logs for detailed monitoring');
  console.log('');
  console.log('🛑 To stop monitoring early, run: stopMonitoring()');
  
  return {
    auctionId: testAuction.id,
    stopMonitoring,
    cleanup: () => cleanupTestAuctions()
  };
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).auctionRenewalTest = {
    createTestExpiredAuction,
    getExpiredActiveAuctions,
    cleanupTestAuctions,
    monitorAuction,
    runRenewalTest
  };
}
