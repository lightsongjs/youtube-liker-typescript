// Supabase Edge Function - Main API Handler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Video {
  video_id: string;
  title: string;
  channel_id: string | null;
  channel_title: string | null;
  url: string;
  duration_seconds: number | null;
  is_short: boolean;
  captions: string | null;
  saved_at: string;
  liked_status: string;
  is_music: boolean;
  is_theological: boolean;
  is_interesting: boolean;
  needs_caption: boolean;
}

interface Tag {
  id: number;
  name: string;
  keystroke: string;
  color: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/api', '');
    const method = req.method;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Route handling
    if (path === '/tags' && method === 'GET') {
      // Get all tags
      const { data, error } = await supabaseClient
        .from('tags')
        .select('*')
        .order('id');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/tags' && method === 'POST') {
      // Create new tag
      const body = await req.json();
      const { name, keystroke, color = '#666666' } = body;

      const { data, error } = await supabaseClient
        .from('tags')
        .insert([{ name, keystroke, color }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    if (path.startsWith('/tags/') && method === 'DELETE') {
      // Delete tag
      const tagId = parseInt(path.split('/')[2]);

      const { error } = await supabaseClient
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/videos' && method === 'GET') {
      // Get all videos with tags
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const filter = url.searchParams.get('filter') || 'all';
      const search = url.searchParams.get('search') || '';
      const offset = (page - 1) * limit;

      let query = supabaseClient
        .from('videos')
        .select('*, video_tags(tag_id, tags(*))', { count: 'exact' });

      // Apply filters
      if (filter === 'liked') {
        query = query.eq('liked_status', 'liked');
      } else if (filter === 'unliked') {
        query = query.eq('liked_status', 'unliked');
      } else if (filter === 'shorts') {
        query = query.eq('is_short', true);
      } else if (filter === 'needs_caption') {
        query = query.eq('needs_caption', true);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,channel_title.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .order('saved_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return new Response(JSON.stringify({ videos: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/videos/toggle-tag' && method === 'POST') {
      // Toggle tag on video
      const { video_id, tag_id } = await req.json();

      // Check if tag already exists
      const { data: existing } = await supabaseClient
        .from('video_tags')
        .select('*')
        .eq('video_id', video_id)
        .eq('tag_id', tag_id)
        .single();

      if (existing) {
        // Remove tag
        const { error } = await supabaseClient
          .from('video_tags')
          .delete()
          .eq('video_id', video_id)
          .eq('tag_id', tag_id);

        if (error) throw error;

        return new Response(JSON.stringify({ action: 'removed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Add tag
        const { error } = await supabaseClient
          .from('video_tags')
          .insert([{ video_id, tag_id }]);

        if (error) throw error;

        return new Response(JSON.stringify({ action: 'added' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/videos/unlike' && method === 'POST') {
      // Unlike video
      const { video_id } = await req.json();

      const { error } = await supabaseClient
        .from('videos')
        .update({ liked_status: 'unliked' })
        .eq('video_id', video_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/videos/caption' && method === 'POST') {
      // Mark video as needing caption
      const { video_id } = await req.json();

      const { error } = await supabaseClient
        .from('videos')
        .update({ needs_caption: true })
        .eq('video_id', video_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 404 Not Found
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
