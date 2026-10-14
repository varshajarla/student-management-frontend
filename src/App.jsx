import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080";

export default function App() {
  const [page, setPage] = useState("home");
  const [role, setRole] = useState("STUDENT");
  const [isRegister, setIsRegister] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Student details
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentMessage, setStudentMessage] = useState("");

  function openAuth(selectedRole, register) {
    setRole(selectedRole);
    setIsRegister(register);
    setFullName("");
    setEmail("");
    setPassword("");
    setMessage("");
    setPage("auth");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (isRegister && !fullName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const body = {
        email: email.trim().toLowerCase(),
        password,
        role,
      };

      if (isRegister) {
        body.fullName = fullName.trim();
      }

      const response = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Please check your account details.");
      }

      if (isRegister) {
        setMessage("Registration successful! Please log in.");
        setIsRegister(false);
        setPassword("");
        return;
      }

      if (!data.role || data.role.toUpperCase() !== role) {
        setMessage("Your account type does not match your selection.");
        return;
      }

      setUser(data);
      setMessage("");
      setPage(role === "FACULTY" ? "faculty" : "student");
    } catch (error) {
      setMessage(
        error.message || "Cannot connect to the backend. Check Spring Boot."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    setStudentsLoading(true);
    setStudentMessage("");

    try {
      const response = await fetch(`${API_URL}/students`);

      if (!response.ok) {
        throw new Error("Unable to load student details.");
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      setStudentMessage(
        error.message || "Cannot connect to the student API."
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  useEffect(() => {
    if (page === "faculty") {
      loadStudents();
    }
  }, [page]);

  async function addStudent(event) {
    event.preventDefault();
    setStudentMessage("");

    if (!studentName.trim() || !studentEmail.trim() || !department.trim()) {
      setStudentMessage("Please complete all student details.");
      return;
    }

    setStudentsLoading(true);

    try {
      const response = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName.trim(),
          email: studentEmail.trim(),
          department: department.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to save student.");
      }

      setStudentMessage("Student details saved successfully!");
      setStudentName("");
      setStudentEmail("");
      setDepartment("");
      await loadStudents();
    } catch (error) {
      setStudentMessage(
        error.message || "Could not save student. Check the backend."
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setPage("home");
    setRole("STUDENT");
    setIsRegister(false);
    setFullName("");
    setEmail("");
    setPassword("");
    setMessage("");
    setStudentMessage("");
  }

  return (
    <div className="app">
      <header className="topbar">
        <h2>🎓 Student Management System</h2>

        {user && (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
      </header>

      {page === "home" && (
        <main className="welcome-box">
          <div className="welcome-icon">📚</div>
          <h1>Welcome!</h1>
          <h2>Student Management System</h2>

          <p>
            Manage student details, attendance, marks, and academic
            performance in one place.
          </p>

          <div className="home-actions">
            <button
              className="primary-btn"
              onClick={() => openAuth("STUDENT", false)}
            >
              Student Login
            </button>

            <button
              className="secondary-btn"
              onClick={() => openAuth("STUDENT", true)}
            >
              Student Register
            </button>

            <button
              className="faculty-btn"
              onClick={() => openAuth("FACULTY", false)}
            >
              Faculty Login
            </button>

            <button
              className="register-faculty-btn"
              onClick={() => openAuth("FACULTY", true)}
            >
              Faculty Registration
            </button>
          </div>

          <p className="small-note">
            Faculty accounts should be approved by an administrator in a
            real deployment.
          </p>
        </main>
      )}

      {page === "auth" && (
        <main className="auth-card">
          <button
            className="back-btn"
            type="button"
            onClick={() => {
              setPage("home");
              setMessage("");
            }}
          >
            ← Back
          </button>

          <h1>
            {role === "FACULTY" ? "👩‍🏫 Faculty" : "🎓 Student"}{" "}
            {isRegister ? "Registration" : "Login"}
          </h1>

          <p className="subtitle">
            {isRegister ? "Create your account" : "Enter your login details"}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <label>
                Full Name
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </label>
            )}

            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            {message && <p className="message">{message}</p>}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          <p className="switch-auth">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage("");
                setPassword("");
              }}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </main>
      )}

      {page === "student" && user && (
        <main className="dashboard-card">
          <h1>🎓 Student Dashboard</h1>
          <p>Welcome, {user.fullName || user.email}!</p>

          <div className="dashboard-grid">
            <div className="dashboard-item">
              <h3>📅 Attendance</h3>
              <p>View attendance records.</p>
            </div>

            <div className="dashboard-item">
              <h3>📝 Marks</h3>
              <p>View academic marks.</p>
            </div>

            <div className="dashboard-item">
              <h3>📈 Performance</h3>
              <p>Review academic progress.</p>
            </div>
          </div>
        </main>
      )}

      {page === "faculty" && user && (
        <main className="dashboard-card">
          <h1>👩‍🏫 Faculty Dashboard</h1>
          <p>Welcome, {user.fullName || user.email}!</p>

          <section className="auth-card">
            <h2>➕ Add Student Details</h2>

            <form onSubmit={addStudent}>
              <label>
                Student Full Name
                <input
                  type="text"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Enter student name"
                  required
                />
              </label>

              <label>
                Student Email
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(event) => setStudentEmail(event.target.value)}
                  placeholder="Enter student email"
                  required
                />
              </label>

              <label>
                Department
                <input
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="Example: ECE"
                  required
                />
              </label>

              {studentMessage && (
                <p className="message" role="status">
                  {studentMessage}
                </p>
              )}

              <button
                className="submit-btn"
                type="submit"
                disabled={studentsLoading}
              >
                {studentsLoading ? "Please wait..." : "Save Student"}
              </button>
            </form>
          </section>

          <section>
            <h2>📋 Student Details</h2>

            <button
              className="primary-btn"
              onClick={loadStudents}
              disabled={studentsLoading}
            >
              Refresh Student List
            </button>

            {students.length === 0 ? (
              <p>
                {studentsLoading
                  ? "Loading students..."
                  : "No students found yet."}
              </p>
            ) : (
              <div className="dashboard-grid">
                {students.map((student) => (
                  <div className="dashboard-item" key={student.id}>
                    <h3>{student.name}</h3>
                    <p>Email: {student.email}</p>
                    <p>Department: {student.department}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      <footer className="footer">
        Student Management System | Academic Progress Made Easier
      </footer>
    </div>
  );
}