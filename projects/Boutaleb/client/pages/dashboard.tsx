import React from "react";
import Head from "next/head";

export default function Dashboard() {
  return (
    <>
      <Head><title>Dashboard</title></Head>
      <main className="page-container">
        <h2 className="page-title">Dashboard</h2>
        <p>Example protected dashboard area.</p>
      </main>
    </>
  );
}
