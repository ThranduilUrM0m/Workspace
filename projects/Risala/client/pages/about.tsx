import React from "react";
import Head from "next/head";

export default function About() {
  return (
    <>
      <Head><title>About</title></Head>
      <main className="page-container">
        <h2 className="page-title">About</h2>
        <p>Project information and links.</p>
      </main>
    </>
  );
}
