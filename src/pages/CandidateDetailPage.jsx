

import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';

function CandidateDetailPage() {
  const { candidateId } = useParams(); // Get the candidate's ID from the URL
  const candidate = useSelector(state =>
    state.candidates.list.find(c => c.id === candidateId)
  );

  if (!candidate) {
    return (
      <div>
        <h2>Candidate not found</h2>
        <Link to="/interviewer">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Link to="/interviewer">← Back to Dashboard</Link>
      
      <h1>{candidate.name}'s Report</h1>

      <div style={{ background: '#918787ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Profile</h3>
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone:</strong> {candidate.phone}</p>
      </div>

      <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>AI Evaluation</h3>
        <p><strong>Final Score:</strong> {candidate.finalScore} / 100</p>
        <p><strong>Summary:</strong> {candidate.summary}</p>
      </div>
      
      <div>
        <h3>Full Interview Transcript</h3>
        {candidate.answers && candidate.answers.length > 0 ? (
          candidate.answers.map((item, index) => (
            <div key={index} className="card" style={{ marginBottom: '15px' }}>
              <p><strong>Question {index + 1}:</strong> {item.question}</p>
              <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
              <p style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                <strong>Answer:</strong> {item.answer || "No answer provided."}
              </p>
            </div>
          ))
        ) : (
          <div className="card">
            <p>No answers were recorded for this interview.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateDetailPage;