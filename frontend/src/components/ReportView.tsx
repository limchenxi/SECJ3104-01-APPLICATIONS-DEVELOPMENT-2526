import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getReportDetails } from '../api/cerapan-service'; // Use your API file
import type { CerapanRecord } from '../type'; // Import your type

// A helper component to display one set of results
function ResultBlock({ title, results, type }) {
  if (!results || results.length === 0) {
    return (
      <div>
        <h4>{title}</h4>
        <p>(Belum ada data)</p>
      </div>
    );
  }

  return (
    <div className="result-block" style={{ marginBottom: '20px' }}>
      <h4>{title}</h4>
      <table width="100%" border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID Soalan</th>
            {type === 'teacher' ? <th>Jawapan Anda</th> : <th>Markah</th>}
            {type !== 'teacher' && <th>Komen Pentadbir</th>}
          </tr>
        </thead>
        <tbody>
          {results.map((item, index) => (
            <tr key={index}>
              <td>{item.questionId}</td>
              {type === 'teacher' ? (
                <td>{item.answer}</td>
              ) : (
                <td>{item.mark}</td>
              )}
              {type !== 'teacher' && <td>{item.comment}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The main page component
export default function ReportView() {
  const { id }_ = useParams<{ id: string }>(); // Get ID from URL
  const [report, setReport] = useState<CerapanRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getReportDetails(id)
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching report:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Loading report...</div>;
  }

  if (!report) {
    return <div>Laporan tidak dijumpai.</div>;
  }

  return (
    <div>
      <h1>Laporan Penuh</h1>
      <h2>Tempoh: {report.period}</h2>
      <h3>Status: {report.status}</h3>
      <hr />

      {/* 1. Teacher's Self-Evaluation */}
      <ResultBlock
        title="Cerapan Kendiri (Jawapan Anda)"
        results={report.self_evaluation.answers}
        type="teacher"
      />

      {/* 2. Admin Observation 1 */}
      <ResultBlock
        title="Pencerapan 1 (Pentadbir)"
        results={report.observation_1.marks}
        type="admin"
      />

      {/* 3. Admin Observation 2 */}
      <ResultBlock
        title="Pencerapan 2 (Pentadbir)"
        results={report.observation_2.marks}
        type="admin"
      />

      {/* You can also display the questions here for reference */}
      <div className="questions-reference" style={{ marginTop: '40px' }}>
        <h4>Rujukan Soalan</h4>
        <ul>
          {report.questions_snapshot.map((q) => (
            <li key={q.questionId}>
              <strong>{q.questionId}</strong>: {q.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}