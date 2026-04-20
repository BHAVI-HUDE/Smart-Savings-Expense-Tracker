import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../services/auth";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
   const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      alert("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post("/auth/login", form);
       setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <form onSubmit={handleLogin}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

       <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
     </form>
  );
}

export default Login;