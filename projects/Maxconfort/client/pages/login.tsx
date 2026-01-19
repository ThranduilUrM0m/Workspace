import React from "react";
import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head><title>Login</title></Head>
      <main className="page-container">
        <h2 className="page-title">Login</h2>
        <p>Integrate Clerk or your auth provider here.</p>
      </main>
    </>
  );
}
