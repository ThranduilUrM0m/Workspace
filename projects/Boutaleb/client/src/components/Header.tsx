import React from 'react';
import Link from 'next/link';
export default function Header(): React.ReactElement {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo">My Workspace</Link>
        <nav className="header-nav">
          <Link href="/" className="header-nav-link">Home</Link>
          <Link href="/about" className="header-nav-link">About</Link>
          <Link href="/dashboard" className="header-nav-link">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
