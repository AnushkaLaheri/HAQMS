'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center py-12 px-6 lg:px-8 text-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-extrabold text-3xl mb-8">
          <Activity className="h-8 w-8 animate-pulse" />
          HAQMS
        </Link>
        
        <div className="glass p-8 rounded-2xl border border-teal-500/20 shadow-xl max-w-sm mx-auto">
          <div className="p-4 bg-teal-500/10 text-teal-600 rounded-full w-fit mx-auto mb-6">
            <Activity className="h-10 w-10 animate-pulse" />
          </div>
          
          <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100">404</h2>
          <h3 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            Resource Not Found
          </h3>
          
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            The page or record you are looking for does not exist or has been moved. 
            Please check the URL or return to the dashboard.
          </p>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="glow-btn inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
