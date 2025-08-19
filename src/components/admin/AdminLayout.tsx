
'use client';

import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // Override any global ad contexts for admin pages
  React.useEffect(() => {
    // Hide any global ad elements that might be injected
    const adElements = document.querySelectorAll('[data-ad], .ad-banner, .ad-container');
    adElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
    });

    // Set admin flag to prevent ad loading
    sessionStorage.setItem('isAdminPanel', 'true');

    return () => {
      sessionStorage.removeItem('isAdminPanel');
      // Restore ad elements when leaving admin
      adElements.forEach(element => {
        (element as HTMLElement).style.display = '';
      });
    };
  }, []);

  return (
    <div className="admin-panel-wrapper" data-admin-panel="true">
      <style jsx global>{`
        .admin-panel-wrapper [data-ad],
        .admin-panel-wrapper .ad-banner,
        .admin-panel-wrapper .ad-container,
        .admin-panel-wrapper .banner-ad,
        .admin-panel-wrapper .social-bar-ad {
          display: none !important;
        }
      `}</style>
      {children}
    </div>
  );
};

export default AdminLayout;
