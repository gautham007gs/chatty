// src/app/api/ai-profile/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { defaultAIProfile } from '@/config/ai';

// In-memory cache for AI profile
let profileCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  try {
    // Check in-memory cache first
    if (profileCache && (Date.now() - profileCache.timestamp) < CACHE_DURATION) {
      console.log('Serving AI profile from memory cache');
      const response = NextResponse.json(profileCache.data);
      // Set cache headers for edge caching
      response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    if (!supabase) {
      console.log('Using default AI profile (no Supabase)');
      profileCache = { data: defaultAIProfile, timestamp: Date.now() };
      const response = NextResponse.json(defaultAIProfile);
      response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      return response;
    }

    const { data, error } = await supabase
      .from('app_configurations')
      .select('settings')
      .eq('id', 'ai_profile')
      .single();

    if (error) {
      console.error('Supabase error fetching AI profile:', error);
      profileCache = { data: defaultAIProfile, timestamp: Date.now() };
      const response = NextResponse.json(defaultAIProfile);
      response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      return response;
    }

    const profile = data?.settings || defaultAIProfile;

    // Update memory cache
    profileCache = { data: profile, timestamp: Date.now() };

    console.log('Serving fresh AI profile from Supabase');
    const response = NextResponse.json(profile);
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    response.headers.set('X-Cache', 'MISS');
    return response;
  } catch (error) {
    console.error('Error in AI profile API:', error);
    const response = NextResponse.json(defaultAIProfile);
    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate'); // Shorter cache on error
    return response;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not available' }, { status: 500 });
    }

    const { error } = await supabase
      .from('app_configurations')
      .upsert({
        id: 'ai_profile',
        settings: body,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating AI profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache when profile is updated
    profileCache = null;
    console.log('AI profile updated and cache invalidated');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in AI profile POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}