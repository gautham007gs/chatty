
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
      suggestions.push('Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
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
      .select('message_id, sender_type, chat_id')
      .limit(1);

    if (messagesError && messagesError.code === '42703') {
      issues.push('messages_log table missing required columns');
      suggestions.push('Run fix_database_schema.sql to add missing columns');
    }

    // Check app_configurations structure
    const { data: configData, error: configError } = await supabase
      .from('app_configurations')
      .select('id, settings')
      .limit(1);

    if (configError && configError.code === '42703') {
      issues.push('app_configurations table has incorrect structure');
      suggestions.push('Recreate app_configurations table with correct schema');
    }

  } catch (error: any) {
    issues.push(`Unexpected error: ${error.message}`);
    suggestions.push('Check your environment variables and network connection');
  }

  return {
    success: issues.length === 0,
    issues,
    suggestions
  };
}

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('app_configurations').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
