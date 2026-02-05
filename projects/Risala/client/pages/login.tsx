import React from "react";
import Head from "next/head";
import { SignIn } from "@clerk/nextjs";

export default function Login(): React.ReactElement {
  return (
    <>
      <Head><title>Login - My Workspace</title></Head>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-slate-800 border border-slate-700 shadow-2xl",
              },
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </main>
    </>
  );
}
