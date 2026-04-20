import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

   const handleRegister = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      alert("Name, email, and password are required");
      return;
    }

    try {
      await API.post("/auth/register", form);
      alert("Registration successful. Please login.");
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
       alert(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <form onSubmit={handleRegister}>
      <h2>Register</h2>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

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
        {isSubmitting ? "Creating account..." : "Register"}
      </button>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </form>
  );
}

export default Register;