import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoBidConfig {
  minDelay: number;
  maxDelay: number;
  chanceToRespond: number;
  maxBidIncrease: number;
}

const fictionalUsers = [
  'María L.', 'José R.', 'Carmen G.', 'Roberto H.', 'Patricia M.',
  'Luis A.', 'Elena V.', 'Carlos P.', 'Isabel F.', 'Antonio S.',
  'Rosa T.', 'Francisco D.', 'Teresa C.', 'Manuel B.', 'Pilar N.',
  'Rafael O.', 'Dolores Q.', 'Ángel W.', 'Esperanza U.', 'Joaquín I.',
  'Diego M.', 'Ana G.', 'Fernando L.', 'Sofía R.', 'Gabriel P.',
  'Valentina S.', 'Alejandro F.', 'Camila T.', 'Sebastián C.', 'Isabella N.'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🎯 Starting auction activity simulation...');

    // Fetch active auctions
    const { data: auctions, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .gte('end_time', new Date().toISOString());

    if (error) {
      console.error('❌ Error fetching auctions:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!auctions || auctions.length === 0) {
      console.log('⚠️ No active auctions found');
      return new Response(JSON.stringify({ message: 'No active auctions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const getAutoBidConfig = (category: string): AutoBidConfig => {
      switch (category) {
        case 'Vinos y Licores':
          return { minDelay: 60, maxDelay: 180, chanceToRespond: 0.4, maxBidIncrease: 50 };
        case 'Navajas':
          return { minDelay: 90, maxDelay: 240, chanceToRespond: 0.5, maxBidIncrease: 40 };
        case 'Electrónicos':
          return { minDelay: 45, maxDelay: 150, chanceToRespond: 0.6, maxBidIncrease: 80 };
        default:
          return { minDelay: 75, maxDelay: 200, chanceToRespond: 0.45, maxBidIncrease: 60 };
      }
    };

    const getRandomUser = () => fictionalUsers[Math.floor(Math.random() * fictionalUsers.length)];
    
    const shouldRespondToBid = (chance: number) => Math.random() < chance;

    let activeBids = 0;

    // Process each auction
    for (const auction of auctions) {
      const config = getAutoBidConfig(auction.category);
      
      // Skip if this auction shouldn't respond based on probability
      if (!shouldRespondToBid(config.chanceToRespond)) {
        continue;
      }

      // Calculate time remaining
      const timeLeft = new Date(auction.end_time).getTime() - new Date().getTime();
      const hoursLeft = timeLeft / (1000 * 60 * 60);

      // Higher activity as auction nears end
      let activityMultiplier = 1;
      if (hoursLeft < 1) activityMultiplier = 3;
      else if (hoursLeft < 2) activityMultiplier = 2;
      else if (hoursLeft < 3) activityMultiplier = 1.5;

      // Adjust chance based on activity multiplier
      if (!shouldRespondToBid(config.chanceToRespond * activityMultiplier)) {
        continue;
      }

      const bidIncrease = Math.floor(Math.random() * config.maxBidIncrease) + 10;
      const newBid = auction.current_bid + bidIncrease;
      const bidder = getRandomUser();

      console.log(`🔥 Placing auto-bid for auction ${auction.id}: ${bidder} bids $${newBid}`);

      // Update auction with new bid
      const { error: updateError } = await supabase
        .from('auctions')
        .update({
          current_bid: newBid,
          current_bidder: bidder,
          total_bids: auction.total_bids + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', auction.id);

      if (updateError) {
        console.error(`❌ Error updating auction ${auction.id}:`, updateError);
      } else {
        activeBids++;
        console.log(`✅ Auto-bid placed: ${bidder} bid $${newBid} on ${auction.title}`);
      }
    }

    console.log(`🎉 Activity simulation complete. Placed ${activeBids} auto-bids.`);

    return new Response(JSON.stringify({ 
      success: true, 
      activeBids,
      totalAuctions: auctions.length,
      message: `Placed ${activeBids} auto-bids across ${auctions.length} active auctions`
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