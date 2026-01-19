import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): React.ReactElement {
  return (
    <div className="layout">
      <Header />
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
}
