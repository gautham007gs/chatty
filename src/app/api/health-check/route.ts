import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Check environment variables
    const envChecks = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      geminiKey: !!process.env.GEMINI_API_KEY
    };

    // Test Supabase connection
    const { data, error } = await supabase
      .from('app_configurations')
      .select('id')
      .limit(1);

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envChecks,
      supabase: {
        connected: !error,
        error: error?.message || null
      }
    });
  } catch (error: any) {
    return Response.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}