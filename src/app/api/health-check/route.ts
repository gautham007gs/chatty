
import { NextResponse } from 'next/server';
import { performSupabaseHealthCheck } from '@/lib/supabaseHealthCheck';

export async function GET() {
  try {
    const healthCheck = await performSupabaseHealthCheck();
    
    const environmentChecks = {
      geminiApiKey: !!process.env.GEMINI_API_KEY,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    const allEnvVarsPresent = Object.values(environmentChecks).every(Boolean);

    return NextResponse.json({
      status: healthCheck.success && allEnvVarsPresent ? 'ready' : 'needs_attention',
      database: healthCheck,
      environment: environmentChecks,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
