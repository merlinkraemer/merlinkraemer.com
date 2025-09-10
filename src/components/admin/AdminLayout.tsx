import React from "react";
import { Link } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <img src="/favicon.png" alt="Logo" className="admin-logo" />
          <h1 className="admin-title">merlin's internet admin</h1>
        </div>
        <div className="admin-header-right">
          <Link to="/" className="admin-link">
            View Site
          </Link>
          <button onClick={onLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Admin Content */}
      <div className="admin-content">{children}</div>
    </div>
  );
};

export default AdminLayout;
