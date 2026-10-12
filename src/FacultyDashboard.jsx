import { useEffect, useState } from "react";
import "./FacultyDashboard.css";

const API = "http://localhost:8080";

function FacultyDashboard() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStudents();
    loadRecords();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);

      const response = await fetch(`${API}/students`);

      if (!response.ok) {
        throw new Error("Unable to load students.");
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecords() {
    try {
      const response = await fetch(`${API}/academic-records`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const recordMap = {};

      data.forEach((record) => {
        const studentId = record.student?.id;

        if (studentId != null) {
          recordMap[studentId] = {
            attendance: record.attendance ?? "",
            marks: record.marks ?? "",
            facultyNote: record.interventionNote ?? "",
          };
        }
      });

      setRecords((previous) => ({
        ...recordMap,
        ...previous,
      }));
    } catch (error) {
      console.error("Could not load academic records:", error);
    }
  }

  function updateRecord(studentId, field, value) {
    setRecords((previous) => ({
      ...previous,
      [studentId]: {
        attendance: previous[studentId]?.attendance ?? "",
        marks: previous[studentId]?.marks ?? "",
        facultyNote: previous[studentId]?.facultyNote ?? "",
        [field]: value,
      },
    }));
  }

  async function saveAcademicRecord(studentId) {
    const record = records[studentId];

    if (
      !record ||
      record.attendance === "" ||
      record.marks === ""
    ) {
      setMessage("Please enter both attendance and marks.");
      return;
    }

    const attendance = Number(record.attendance);
    const marks = Number(record.marks);

    if (
      !Number.isFinite(attendance) ||
      attendance < 0 ||
      attendance > 100 ||
      !Number.isFinite(marks) ||
      marks < 0 ||
      marks > 100
    ) {
      setMessage("Attendance and marks must be between 0 and 100.");
      return;
    }

    try {
      setSavingId(studentId);
      setMessage("");

      const response = await fetch(`${API}/academic-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: Number(studentId),
          attendance,
          marks,
          interventionNote: record.facultyNote || "",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save the academic record."
        );
      }

      setMessage("Academic record saved successfully!");
      await loadRecords();
    } catch (error) {
      setMessage(error.message || "Unable to connect to the backend.");
    } finally {
      setSavingId(null);
    }
  }

  function getStatus(record) {
    if (
      record.attendance === "" ||
      record.marks === ""
    ) {
      return "Not evaluated";
    }

    return Number(record.attendance) < 75 ||
      Number(record.marks) < 40
      ? "Needs support"
      : "On track";
  }

  const evaluatedCount = students.filter((student) => {
    const record = records[student.id];

    return (
      record &&
      record.attendance !== "" &&
      record.marks !== ""
    );
  }).length;

  const supportCount = students.filter((student) => {
    return getStatus(records[student.id] || {}) === "Needs support";
  }).length;

  return (
    <main className="faculty-dashboard">
      <header className="faculty-header">
        <h1>Faculty Dashboard</h1>
        <p>Manage student attendance, marks, and academic progress.</p>
      </header>

      {message && (
        <p className="faculty-message" role="status">
          {message}
        </p>
      )}

      <section className="faculty-stats">
        <div className="faculty-stat-card">
          <h3>Total Students</h3>
          <p>{students.length}</p>
        </div>

        <div className="faculty-stat-card">
          <h3>Evaluated</h3>
          <p>{evaluatedCount}</p>
        </div>

        <div className="faculty-stat-card">
          <h3>Needs Support</h3>
          <p>{supportCount}</p>
        </div>
      </section>

      <div className="faculty-actions">
        <button
          type="button"
          onClick={() => {
            loadStudents();
            loadRecords();
          }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Students"}
        </button>
      </div>

      {loading && students.length === 0 ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found. Check whether the backend is running.</p>
      ) : (
        <section className="faculty-student-list">
          {students.map((student) => {
            const record = records[student.id] || {
              attendance: "",
              marks: "",
              facultyNote: "",
            };

            const status = getStatus(record);

            return (
              <article
                className="faculty-student-card"
                key={student.id}
              >
                <h2>{student.name}</h2>

                <p>
                  <strong>Student ID:</strong> {student.id}
                </p>

                <p>
                  <strong>Email:</strong> {student.email}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {student.department}
                </p>

                <div className="faculty-field">
                  <label htmlFor={`attendance-${student.id}`}>
                    Attendance (%)
                  </label>

                  <input
                    id={`attendance-${student.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={record.attendance}
                    onChange={(event) =>
                      updateRecord(
                        student.id,
                        "attendance",
                        event.target.value
                      )
                    }
                    placeholder="Enter attendance"
                  />
                </div>

                <div className="faculty-field">
                  <label htmlFor={`marks-${student.id}`}>
                    Marks (out of 100)
                  </label>

                  <input
                    id={`marks-${student.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={record.marks}
                    onChange={(event) =>
                      updateRecord(
                        student.id,
                        "marks",
                        event.target.value
                      )
                    }
                    placeholder="Enter marks"
                  />
                </div>

                <div className="faculty-field">
                  <label htmlFor={`note-${student.id}`}>
                    Faculty Note
                  </label>

                  <textarea
                    id={`note-${student.id}`}
                    value={record.facultyNote}
                    onChange={(event) =>
                      updateRecord(
                        student.id,
                        "facultyNote",
                        event.target.value
                      )
                    }
                    placeholder="Enter faculty note"
                    rows="3"
                  />
                </div>

                <p>
                  <strong>Academic Status:</strong>{" "}
                  <span
                    className={
                      status === "On track"
                        ? "status-on-track"
                        : status === "Needs support"
                        ? "status-support"
                        : "status-pending"
                    }
                  >
                    {status}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => saveAcademicRecord(student.id)}
                  disabled={savingId === student.id}
                >
                  {savingId === student.id
                    ? "Saving..."
                    : "Save Academic Record"}
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default FacultyDashboard;