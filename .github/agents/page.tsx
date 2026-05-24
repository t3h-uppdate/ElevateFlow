import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Root Page
 * 
 * Handles initial entry into the application.
 * Redirects to dashboard if authenticated, otherwise to login.
 */
export default async function RootPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  redirect('/dashboard');
}