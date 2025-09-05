import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DynamicStats {
  activeUsers: number;
  totalAuctionsToday: number;
  liveAuctions: number;
}

export function useDynamicStats() {
  const [stats, setStats] = useState<DynamicStats>({
    activeUsers: 0,
    liveAuctions: 0,
    totalAuctionsToday: 0
  });

  const [loading, setLoading] = useState(true);

  // Generate realistic active users count (50-150)
  const generateActiveUsers = () => {
    const baseUsers = 50 + Math.floor(Math.random() * 100); // 50-150
    // Add small random variation every update
    const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
    return Math.max(50, Math.min(150, baseUsers + variation));
  };

  const fetchStats = async () => {
    try {
      // Get count of active auctions
      const { data: activeAuctions, error } = await supabase
        .from('auctions')
        .select('id')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching auction stats:', error);
        return;
      }

      const liveCount = activeAuctions?.length || 0;
      
      // Calculate total auctions today (30% more than active auctions)
      const totalToday = Math.ceil(liveCount * 1.3);
      
      // Generate active users
      const activeUsersCount = generateActiveUsers();

      setStats({
        activeUsers: activeUsersCount,
        liveAuctions: liveCount,
        totalAuctionsToday: totalToday
      });

    } catch (error) {
      console.error('Error in fetchStats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update stats every 30 seconds
  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Update active users more frequently (every 10 seconds) for dynamic feel
  useEffect(() => {
    const userInterval = setInterval(() => {
      setStats(prevStats => ({
        ...prevStats,
        activeUsers: generateActiveUsers()
      }));
    }, 10000);

    return () => clearInterval(userInterval);
  }, []);

  return {
    stats,
    loading
  };
}
