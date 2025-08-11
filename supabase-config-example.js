// Supabase Configuration Example
// Copy this file to your project root and update with your real Supabase credentials

window.supabaseConfig = {
    // Your Supabase project URL (found in Settings > API)
    url: 'https://your-project-id.supabase.co',
    
    // Your Supabase anonymous/public key (found in Settings > API)
    // This should be a long string starting with 'eyJ' and containing many characters
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc4ODc4NDAwLCJleHAiOjE5OTQ0NTQ0MDB9.your-signature-here',
    
    // Set to false to use real Supabase, true for demo mode
    demoMode: false
};

// To get your real Supabase credentials:
// 1. Go to https://supabase.com/dashboard
// 2. Select your project
// 3. Go to Settings > API
// 4. Copy the Project URL and the "anon public" key
// 5. Replace the values above with your real credentials
