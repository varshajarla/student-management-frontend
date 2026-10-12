import { useState } from "react";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import "./App.css";

const API_URL = "http://localhost:8080";

function App() {
  const [page, setPage] = useState("welcome");
  const [role, setRole] = useState("STUDENT");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openLogin(selectedRole) {
    setRole(selectedRole);
    setEmail("");
    setPassword("");
    setMessage("");
    setPage("login");
  }

  function openRegister() {
    setRole("STUDENT");
    setFullName("");
    setEmail("");
    setPassword("");
    setMessage("");
    setPage("register");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      const accountRole = String(data.role || role).toUpperCase();

      if (accountRole === "STUDENT") {
        setPage("student");
      } else if (accountRole === "FACULTY") {
        setPage("faculty");
      } else {
        throw new Error("Unknown account role.");
      }

      setPassword("");
      setMessage("");
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role: "STUDENT",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setMessage("Registration successful! Please log in.");
      setPassword("");
      setPage("login");
      setRole("STUDENT");
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setPage("welcome");
    setFullName("");
    setEmail("");
    setPassword("");
    setMessage("");
    setRole("STUDENT");
  }

  if (page === "student") {
    return (
      <>
        <button onClick={logout}>Logout</button>
        <StudentDashboard />
      </>
    );
  }

  if (page === "faculty") {
    return (
      <>
        <button onClick={logout}>Logout</button>
        <FacultyDashboard />
      </>
    );
  }

  return (
    <main className="auth-container">
      <h1>Student Management System</h1>
      <p>Manage student information and academic progress.</p>

      {page === "welcome" && (
        <section className="auth-card">
          <h2>Welcome!</h2>
          <p>Choose your account type to continue.</p>

          <button onClick={() => openLogin("STUDENT")}>
            Student Login
          </button>

          <button onClick={openRegister}>
            Student Register
          </button>

          <hr />

          <button onClick={() => openLogin("FACULTY")}>
            Faculty Login
          </button>
        </section>
      )}

      {(page === "login" || page === "register") && (
        <section className="auth-card">
          <h2>
            {role === "STUDENT" ? "Student" : "Faculty"}{" "}
            {page === "login" ? "Login" : "Registration"}
          </h2>

          <form
            onSubmit={
              page === "login" ? handleLogin : handleRegister
            }
          >
            {page === "register" && (
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : page === "login"
                  ? "Login"
                  : "Create Account"}
            </button>
          </form>

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          {role === "STUDENT" && (
            <p>
              {page === "login"
                ? "New student? "
                : "Already registered? "}

              <button
                type="button"
                onClick={() => {
                  setPage(
                    page === "login" ? "register" : "login"
                  );
                  setPassword("");
                  setMessage("");
                }}
              >
                {page === "login" ? "Register" : "Login"}
              </button>
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setPage("welcome");
              setMessage("");
            }}
          >
            Back
          </button>
        </section>
      )}
    </main>
  );
}

export default App;