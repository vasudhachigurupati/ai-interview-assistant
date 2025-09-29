// src/App.jsx

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';
import CandidateDetailPage from './pages/CandidateDetailPage'; // 1. IMPORT THE NEW PAGE
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Navigation Header */}
        <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: '1rem', textDecoration: 'none' }}>
            Interviewee Tab
          </Link>
          <Link to="/interviewer" style={{ textDecoration: 'none' }}>
            Interviewer Tab
          </Link>
        </nav>

        {/* Page Content */}
        <main style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<IntervieweePage />} />
            <Route path="/interviewer" element={<InterviewerPage />} />
            {/* 2. ADD THIS NEW ROUTE */}
            <Route path="/candidate/:candidateId" element={<CandidateDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;