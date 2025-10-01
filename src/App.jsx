
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';
import CandidateDetailPage from './pages/CandidateDetailPage'; 

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

      <main className="container">
  <div className="app-shell"> {/* <-- ADD THIS WRAPPER */}
    <Routes>
      <Route path="/" element={<IntervieweePage />} />
      <Route path="/interviewer" element={<InterviewerPage />} />
      <Route path="/candidate/:candidateId" element={<CandidateDetailPage />} />
    </Routes>
  </div> {/* <-- AND THIS CLOSING TAG */}
</main>
      </div>
    </BrowserRouter>
  );
}

export default App;