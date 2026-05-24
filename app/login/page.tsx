'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Inloggning misslyckades', {
          description: error.message === 'Invalid login credentials' 
            ? 'Felaktig e-postadress eller lösenord.' 
            : error.message,
        });
        setLoading(false);
        return;
      }

      toast.success('Välkommen!');
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      toast.error('Ett oväntat fel uppstod');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster />
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">ElevateFlow AI</h1>
          <p className="text-gray-500 mt-1">Logga in för att fortsätta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border p-3 rounded-2xl"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border p-3 rounded-2xl"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-2xl font-medium disabled:opacity-60 mt-2"
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  );
}
