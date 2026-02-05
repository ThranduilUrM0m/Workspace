import React from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Head from "next/head";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <Head>
        <title>Dashboard - My Workspace</title>
      </Head>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Dark Navigation Bar */}
          <nav className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-8">
                  <Link href="/dashboard" className="font-bold text-lg text-white hover:text-blue-400 transition">
                    Dashboard
                  </Link>
                  <div className="hidden sm:flex gap-4">
                    <Link href="/" className="text-slate-300 hover:text-white transition">
                      Home
                    </Link>
                    <Link href="/about" className="text-slate-300 hover:text-white transition">
                      About
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <UserGreeting />
                  <Link href="/api/auth/signout" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                    Sign Out
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function UserGreeting(): React.ReactElement {
  const { user } = useUser();
  return (
    <div className="text-slate-200 text-sm">
      Welcome, <span className="font-semibold text-white">{user?.firstName || "User"}</span>
    </div>
  );
}
