import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  // 1. Inputs ko yaad rakhne ke liye 'State' (Beginner level)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 2. Context aur Router ke tools
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 3. Login Button dabane par kya hoga?
  const handleSubmit = async (e) => {
    e.preventDefault(); // Page refresh hone se roknay ke liye
    setError("");

    try {
      // Absolute URL ki jagah relative URL use karein (Proxy ke zariye)
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true },
      ); // Cookies allow kiye

      if (response.data.success) {
        // Agar login thik raha, toh Context mein user save karo
        login(response.data.user);

        // User ko Upload Page par bhej do
        navigate("/");
      }
    } catch (err) {
      // Agar koi ghalti hui (maslan wrong password)
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Account nahi hai? <Link to="/register">Yahan Register karein</Link>
      </p>
    </div>
  );
};

export default LoginPage;
