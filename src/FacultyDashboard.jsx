import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/students";

export default function FacultyDashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStudents() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load students");
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Could not load students. Check the backend.");
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function addStudent(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          department: department.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save student");
      }

      setMessage("Student details saved successfully!");
      setName("");
      setEmail("");
      setDepartment("");
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-card">
      <h1>👩‍🏫 Faculty Dashboard</h1>
      <p>Add students and manage their details.</p>

      <section className="auth-card">
        <h2>➕ Add Student Details</h2>

        <form onSubmit={addStudent}>
          <label>
            Student Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter student email"
              required
            />
          </label>

          <label>
            Department
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Example: ECE"
              required
            />
          </label>

          {message && <p className="message">{message}</p>}

          <button
            className="submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Student"}
          </button>
        </form>
      </section>

      <section>
        <h2>📋 Student Details</h2>

        {students.length === 0 ? (
          <p>No students found yet.</p>
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

        <button className="primary-btn" onClick={loadStudents}>
          Refresh Student List
        </button>
      </section>
    </main>
  );
}