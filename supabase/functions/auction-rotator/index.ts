
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting auction rotation...');

    // Find auctions that have ended
    const { data: endedAuctions, error: fetchError } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .lte('end_time', new Date().toISOString());

    if (fetchError) {
      console.error('❌ Error fetching ended auctions:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!endedAuctions || endedAuctions.length === 0) {
      console.log('✅ No auctions need renewal');
      return new Response(JSON.stringify({ message: 'No auctions to renew' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let renewedCount = 0;

    // Renew each ended auction
    for (const auction of endedAuctions) {
      const newEndTime = new Date();
      newEndTime.setHours(newEndTime.getHours() + 6); // 6 hours from now

      // Reset auction for new round
      const { error: updateError } = await supabase
        .from('auctions')
        .update({
          end_time: newEndTime.toISOString(),
          current_bid: auction.minimum_bid,
          current_bidder: null,
          total_bids: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', auction.id);

      if (updateError) {
        console.error(`❌ Error renewing auction ${auction.id}:`, updateError);
      } else {
        renewedCount++;
        console.log(`✅ Renewed auction: ${auction.title} - ends at ${newEndTime.toISOString()}`);
      }
    }

    console.log(`🎉 Auction rotation complete. Renewed ${renewedCount} auctions.`);

    return new Response(JSON.stringify({
      success: true,
      renewedCount,
      totalProcessed: endedAuctions.length,
      message: `Renewed ${renewedCount} auctions for 6 more hours`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
