import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

function StudentDashboard({ onLogout }) {
  const [student, setStudent] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudentData() {
    setLoading(true);
    setError("");

    try {
      // Get student details
      const studentsResponse = await fetch(`${API_URL}/students`);

      if (!studentsResponse.ok) {
        throw new Error("Unable to load student details.");
      }

      const studentsData = await studentsResponse.json();
      const students = Array.isArray(studentsData)
        ? studentsData
        : studentsData.content || [];

      if (students.length === 0) {
        throw new Error("No student records found.");
      }

      // Use the logged-in email if available; otherwise use the first student.
      const loginEmail = (
        localStorage.getItem("userEmail") || ""
      ).toLowerCase();

      const selectedStudent =
        students.find(
          (item) =>
            (item.email || "").toLowerCase() === loginEmail
        ) || students[0];

      setStudent(selectedStudent);

      // Get academic record for this student
      const recordResponse = await fetch(
        `${API_URL}/academic-records/${selectedStudent.id}`
      );

      if (recordResponse.ok) {
        const recordData = await recordResponse.json();
        setRecord(recordData);
      } else if (recordResponse.status === 404) {
        setRecord(null);
      } else {
        throw new Error("Unable to load academic records.");
      }
    } catch (err) {
      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudentData();
  }, []);

  const attendance = record?.attendance;
  const marks = record?.marks;

  const hasRecord =
    attendance !== null &&
    attendance !== undefined &&
    marks !== null &&
    marks !== undefined;

  const needsSupport =
    hasRecord && (Number(attendance) < 75 || Number(marks) < 40);

  const academicStatus = !hasRecord
    ? "No records available"
    : needsSupport
      ? "Needs support"
      : "On track";

  const facultyNote =
    record?.interventionNote ||
    record?.facultyNote ||
    record?.note ||
    (needsSupport
      ? "Faculty review and support recommended."
      : hasRecord
        ? "No immediate academic concerns."
        : "Your faculty has not added academic records yet.");

  if (loading) {
    return (
      <main style={styles.page}>
        <h1>Student Dashboard</h1>
        <p>Loading your details...</p>
      </main>
    );
  }

  if (error && !student) {
    return (
      <main style={styles.page}>
        <h1>Student Dashboard</h1>
        <p style={styles.error}>{error}</p>
        <button style={styles.button} onClick={loadStudentData}>
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.topBar}>
        <button
          style={styles.button}
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              localStorage.removeItem("userEmail");
              window.location.reload();
            }
          }}
        >
          Logout
        </button>
      </div>

      <h1 style={styles.title}>Student Dashboard</h1>
      <p style={styles.subtitle}>
        View your details and academic progress.
      </p>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <h2 style={styles.heading}>My Details</h2>

        <p>
          <strong>Student ID:</strong> {student.id}
        </p>
        <p>
          <strong>Name:</strong>{" "}
          {student.name || student.fullName || "Not available"}
        </p>
        <p>
          <strong>Email:</strong> {student.email || "Not available"}
        </p>
        <p>
          <strong>Department:</strong>{" "}
          {student.department || "Not available"}
        </p>
      </section>

      <section style={styles.card}>
        <h2 style={styles.heading}>My Academic Records</h2>

        {hasRecord ? (
          <>
            <p>
              <strong>Attendance:</strong> {attendance}%
            </p>
            <p>
              <strong>Marks:</strong> {marks}/100
            </p>
          </>
        ) : (
          <p>No academic record has been added yet.</p>
        )}

        <p>
          <strong>Academic Status:</strong>{" "}
          <span
            style={{
              color: needsSupport ? "#b42318" : hasRecord ? "#237443" : "#666",
              fontWeight: "bold",
            }}
          >
            {academicStatus}
          </span>
        </p>

        <p>
          <strong>Faculty Note:</strong> {facultyNote}
        </p>
      </section>

      <button
        style={styles.button}
        onClick={loadStudentData}
        disabled={loading}
      >
        Refresh My Records
      </button>
    </main>
  );
}

const styles = {
  page: {
    maxWidth: "850px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    color: "#263746",
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
  },
  title: {
    textAlign: "center",
    color: "#174a70",
    fontSize: "clamp(28px, 5vw, 42px)",
    marginBottom: "5px",
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: "30px",
  },
  card: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  heading: {
    color: "#174a70",
    marginTop: "0",
  },
  button: {
    background: "#0879b9",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px 20px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "#b42318",
    textAlign: "center",
  },
};

export default StudentDashboard;