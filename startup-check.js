
// Load environment variables from .env file
require('dotenv').config();

console.log('🔍 Kruthika Chat - Startup Verification');
console.log('=====================================');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GEMINI_API_KEY'
];

const missing = [];
const present = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    present.push(varName);
    console.log(`✅ ${varName}: SET`);
  } else {
    missing.push(varName);
    console.log(`❌ ${varName}: MISSING`);
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Environment variables set: ${present.length}/${requiredEnvVars.length}`);

if (missing.length > 0) {
  console.log(`❌ Missing variables: ${missing.join(', ')}`);
  console.log('\n🔧 Action Required:');
  console.log('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
} else {
  console.log('🎉 All environment variables are configured!');
  console.log('\n🚀 Starting the application...');
}
