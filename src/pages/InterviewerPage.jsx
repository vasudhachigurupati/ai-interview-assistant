// src/pages/InterviewerPage.jsx
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function InterviewerPage() {
  const navigate = useNavigate();
  // Get the list of all candidates from the Redux store
  const candidates = useSelector((state) => state.candidates.list);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for highest score first

  // Memoize the filtered and sorted list to avoid re-calculating on every render
  const filteredAndSortedCandidates = useMemo(() => {
    return candidates
      .filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === 'desc') {
          return (b.finalScore || 0) - (a.finalScore || 0);
        } else {
          return (a.finalScore || 0) - (b.finalScore || 0);
        }
      });
  }, [candidates, searchTerm, sortOrder]);

  const handleCandidateClick = (candidateId) => {
    navigate(`/candidate/${candidateId}`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto' }}>
      <h1>Interviewer Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
        <input
          className="input"
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ padding: '8px' }}>
          <option value="desc">Sort by Score (High to Low)</option>
          <option value="asc">Sort by Score (Low to High)</option>
        </select>
      </div>

      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid black' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Final Score</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>AI Summary</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedCandidates.map(candidate => (
            <tr
              key={candidate.id}
              onClick={() => handleCandidateClick(candidate.id)}
              style={{ cursor: 'pointer', borderBottom: '1px solid #ccc' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: '10px' }}>{candidate.name}</td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{candidate.finalScore !== null ? `${candidate.finalScore} / 100` : 'N/A'}</td>
              <td style={{ padding: '10px' }}>{candidate.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {candidates.length === 0 && <p>No candidates have completed the interview yet.</p>}
    </div>
  );
}

export default InterviewerPage;