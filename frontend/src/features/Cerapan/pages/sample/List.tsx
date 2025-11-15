// src/components/List.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation
import { getMyTasks, getMyReports } from '../api/cerapan-service'; // Use your API file
import type { CerapanRecord } from '../type'; // Import your type

export default function List() {
  const [tasks, setTasks] = useState<CerapanRecord[]>([]);
  const [reports, setReports] = useState<CerapanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both lists at the same time
    Promise.all([getMyTasks(), getMyReports()])
      .then(([tasksData, reportsData]) => {
        setTasks(tasksData);
        setReports(reportsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []); // Runs once on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Dashboard Cerapan</h2>

      {/* === Section 1: To-Do List === */}
      <div className="tasks-section" style={{ marginBottom: '40px' }}>
        <h3>Tugasan Anda (Sila Selesaikan)</h3>
        {tasks.length === 0 ? (
          <p>Tiada tugasan baru.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task._id}>
                {/* Link to the form-filling page */}
                <Link to={`/cerapan/task/${task._id}`}>
                  Tugasan untuk Tempoh: {task.period} (Status: {task.status})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* === Section 2: Report History === */}
      <div className="reports-section">
        <h3>Sejarah Laporan</h3>
        {reports.length === 0 ? (
          <p>Tiada laporan untuk dipaparkan.</p>
        ) : (
          <ul>
            {reports.map((report) => (
              <li key={report._id}>
                {/* Link to the "view report" page (you'll build this later) */}
                <Link to={`/cerapan/report/${report._id}`}>
                  Laporan untuk Tempoh: {report.period} (Status: {report.status})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}