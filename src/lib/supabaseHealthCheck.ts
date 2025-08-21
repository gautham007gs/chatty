import { supabase } from './supabaseClient';

interface HealthCheckResult {
  success: boolean;
  issues: string[];
  suggestions: string[];
}

export async function performSupabaseHealthCheck(): Promise<HealthCheckResult> {
  const issues: string[] = [];
  const suggestions: string[] = [];

  try {
    // Test basic connectivity
    const { error: connectionError } = await supabase.from('app_configurations').select('id').limit(1);
    if (connectionError) {
      issues.push(`Connection failed: ${connectionError.message}`);
    }

    // Check required tables exist
    const requiredTables = ['app_configurations', 'messages_log', 'daily_activity_log'];
    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === '42P01') {
        issues.push(`Missing table: ${table}`);
        suggestions.push(`Run the SQL setup script to create ${table} table`);
      }
    }

    // Check messages_log columns
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages_log')
      .select('user_id, text_content, has_image')
      .limit(1);

    if (messagesError && messagesError.code === '42703') {
      issues.push('messages_log table missing required columns');
      suggestions.push('Run fix_database_schema.sql to add missing columns');
    }

    // Test AI profile fetch
    const { error: profileError } = await supabase
      .from('app_configurations')
      .select('settings')
      .eq('id', 'ai_profile_kruthika_chat_v1')
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      suggestions.push('Set up AI profile in admin panel');
    }

    return {
      success: issues.length === 0,
      issues,
      suggestions
    };

  } catch (error: any) {
    issues.push(`Health check failed: ${error.message}`);
    return { success: false, issues, suggestions };
  }
}