'use client';

import React from 'react';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">ElevateFlow</Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
            <Link href="/admin/companies" className="text-gray-600 hover:text-black">Företag</Link>
          </div>
        </div>
      </nav>
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}