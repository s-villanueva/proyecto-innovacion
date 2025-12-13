import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixfiawsbekmxmqghsssh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Zmlhd3NiZWtteG1xZ2hzc3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MTAxMzIsImV4cCI6MjA4MTA4NjEzMn0.Sk3Zjj0pFfsoaU-XDSxjdqcPD7OKoDX5RDsFRCEbLsY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('documents').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Connection failed:', error.message);
        } else {
            console.log('Connection successful!');
        }

        // Also test auth if possible, but we don't have a user/pass.
        // We can check if we can get the session (should be null).
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Session check failed:', sessionError.message);
        } else {
            console.log('Session check successful (session is ' + (sessionData.session ? 'active' : 'null') + ')');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
