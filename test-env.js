
console.log('Testing environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

// Show first few characters of values if they exist
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('Supabase URL starts with:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...');
}
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Supabase Key starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...');
}
