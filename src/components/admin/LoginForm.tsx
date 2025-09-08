import React, { useState } from "react";

interface LoginFormProps {
  onLogin: (password: string) => void;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div
      style={{
        fontFamily: "monospace",
        margin: "60px",
        textAlign: "center",
        lineHeight: "1.6",
      }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          padding: "30px",
          maxWidth: "450px",
          margin: "0 auto",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "15px" }}>Merlin's Internet Admin</h2>
          <p style={{ marginBottom: "25px", fontSize: "13px" }}>
            Enter your password to access the admin panel
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Password:
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
              }}
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: "15px" }}>
              <strong>ERROR:</strong> {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
              }}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
