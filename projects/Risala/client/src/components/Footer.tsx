import React from 'react';

export default function Footer(): React.ReactElement {
  return (
    <footer className="footer">
      <div className="footer-container">
        © {new Date().getFullYear()} My Workspace — scaffold
      </div>
    </footer>
  );
}
