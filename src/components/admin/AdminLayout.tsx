import React from "react";
import { Link } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
  return (
    <div
      style={{
        fontFamily: "monospace",
        margin: "40px auto",
        lineHeight: "1.6",
        maxWidth: "1000px",
        padding: "0 20px",
      }}
    >
      {/* Admin Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "2px solid #ccc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img
            src="/favicon.png"
            alt="Logo"
            className="logo"
            style={{
              width: "32px",
              height: "32px",
              cursor: "pointer",
              margin: 0,
            }}
          />
          <h1 style={{ margin: 0, fontSize: "24px" }}>
            merlin's internet admin
          </h1>
        </div>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              padding: "8px 15px",
              border: "1px solid #ccc",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            View Site
          </Link>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 15px",
              border: "1px solid #ccc",
              color: "red",
              background: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Admin Content */}
      {children}
    </div>
  );
};

export default AdminLayout;
