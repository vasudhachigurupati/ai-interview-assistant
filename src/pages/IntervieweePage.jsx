

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCandidate } from '../features/candidatesSlice';
// Import our new actions
import { fetchQuestion, submitAnswer, resetInterview, getFinalEvaluation } from '../features/interviewSlice';

import ResumeUpload from '../components/ResumeUpload';
import Chatbot from '../components/Chatbot';

// ... (initialBotMessage is the same)
const initialBotMessage = {
  text: "Hello! I've reviewed your resume. I just need to confirm a few details before we begin.",
  sender: 'bot',
};

function IntervieweePage() {
  const [step, setStep] = useState('upload');
  const [candidateData, setCandidateData] = useState({ name: '', email: '', phone: '' });
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const dispatch = useDispatch();
  const interview = useSelector((state) => state.interview);
  
  const [timeLeft, setTimeLeft] = useState(interview.timerValue);

  // This powerful useEffect now controls the entire interview flow
  useEffect(() => {
  if (interview.currentQuestionIndex < 6 && interview.status === 'loading') {
    dispatch(fetchQuestion());
  }
  if (interview.currentQuestionIndex === 6 && interview.status !== 'evaluating' && interview.status !== 'finished') {
    // After the 6th question, dispatch the evaluation thunk
    dispatch(getFinalEvaluation(interview.answers));
    setStep('finished');
  }
}, [interview.currentQuestionIndex, interview.status, dispatch,interview.answers]);
  // This useEffect now controls the timer
  useEffect(() => {
    // When a new question is loaded, reset the local timer
    if (interview.status === 'active') {
      setTimeLeft(interview.timerValue);
    }

    if (timeLeft <= 0 || interview.status !== 'active') {
      return; // Stop if time is up or not in an active question
    }
    
    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, interview.status, interview.timerValue]);


  const handleSubmitAnswer = () => {
    // When time is up or button is clicked, dispatch the answer to Redux
    dispatch(submitAnswer(currentAnswer));
    setCurrentAnswer(''); // Clear the textarea
  };

  const handleStartInterview = () => {
    dispatch(resetInterview()); // Reset previous interview state
    dispatch(addCandidate(candidateData));
    setStep('interview');
    // Trigger the first question fetch
    dispatch(fetchQuestion());
  };

  // ... (All other handler functions for the pre-interview steps are the same)
  const [messages, setMessages] = useState([initialBotMessage]);
  const [userInput, setUserInput] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  useEffect(() => {
    if (step === 'data_received') {
      const fields = ['name', 'email', 'phone'].filter(field => !candidateData[field]);
      if (fields.length > 0) {
        setMissingFields(fields);
        askNextQuestion(fields);
        setStep('chat');
      } else {
        setMessages(prev => [...prev, { text: "All your information looks complete. Please review and correct any errors below.", sender: 'bot' }]);
        setStep('confirm');
      }
    }
  }, [step, candidateData]);
  const askNextQuestion = (fields) => {
    const nextField = fields[0];
    let question = '';
    if (nextField === 'name') question = "I couldn't find your full name. What is it?";
    if (nextField === 'email') question = "I couldn't find a valid email address. What's the best email to reach you?";
    if (nextField === 'phone') question = "I couldn't find a phone number. What number can we contact you at?";
    setMessages(prev => [...prev, { text: question, sender: 'bot' }]);
  };
  const handleDataExtracted = (data) => {
    const sanitizedData = { name: data.name || '', email: data.email || '', phone: data.phone || '' };
    setCandidateData(sanitizedData);
    setStep('data_received');
  };
  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const newMessages = [...messages, { text: userInput, sender: 'user' }];
    const currentField = missingFields[0];
    const updatedData = { ...candidateData, [currentField]: userInput };
    setCandidateData(updatedData);
    const remainingFields = missingFields.slice(1);
    setMissingFields(remainingFields);
    if (remainingFields.length > 0) {
      askNextQuestion(remainingFields);
    } else {
      newMessages.push({ text: "Great, that's all I needed. Please review and correct any errors below.", sender: 'bot' });
      setStep('confirm');
    }
    setMessages(newMessages);
    setUserInput('');
  };
  const handleConfirmationChange = (e) => {
    const { name, value } = e.target;
    setCandidateData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {/* ... (upload, chat, and confirm JSX is the same) ... */}
      {step === 'upload' && <ResumeUpload onDataExtracted={handleDataExtracted} />}
      {step === 'chat' && <Chatbot messages={messages} userInput={userInput} onUserInputChange={handleUserInputChange} onSendMessage={handleSendMessage} isWaitingForResponse={false} />}
      {step === 'confirm' && (
        <div style={{ maxWidth: '600px', margin: '20px auto', textAlign: 'center' }}>
          <h2>✅ Review and Correct Your Details</h2>
          <p style={{color: '#555'}}>If anything is wrong, please fix it below.</p>
          <div style={{ margin: '10px 0', textAlign: 'left' }}><label>Full Name:</label><input type="text" name="name" value={candidateData.name} onChange={handleConfirmationChange} style={{ width: '100%', padding: '8px' }} /></div>
          <div style={{ margin: '10px 0', textAlign: 'left' }}><label>Email:</label><input type="email" name="email" value={candidateData.email} onChange={handleConfirmationChange} style={{ width: '100%', padding: '8px' }}/></div>
          <div style={{ margin: '10px 0', textAlign: 'left' }}><label>Phone:</label><input type="tel" name="phone" value={candidateData.phone} onChange={handleConfirmationChange} style={{ width: '100%', padding: '8px' }}/></div>
          <button onClick={handleStartInterview} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}>Confirm and Start Interview</button>
        </div>
      )}

      {step === 'interview' && (
        <div style={{ maxWidth: '800px', margin: '20px auto', textAlign: 'center' }}>
          <h2>Interview in Progress...</h2>
          <h3>Question {interview.currentQuestionIndex + 1} of 6</h3>
          <div className="card">
            <p>{interview.currentQuestion}</p>
          </div>
          <h2 style={{ color: timeLeft <= 5 && timeLeft > 0 ? 'red' : 'black' }}>
            {timeLeft > 0 ? `Time Left: ${timeLeft}s` : "Time's Up!"}
          </h2>
          <textarea
            className="textarea"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            style={{ width: '100%', minHeight: '150px', padding: '10px', fontSize: '1rem' }}
            disabled={interview.status !== 'active' || timeLeft <= 0}
          />
          <button 
            className="button"
            onClick={handleSubmitAnswer}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
            disabled={interview.status !== 'active' || timeLeft <= 0}
          >
            Submit Answer
          </button>
        </div>
      )}

      
      {step === 'finished' && (
      <div style={{ textAlign: 'center' }}>
        <h2>Interview Complete!</h2>
        {interview.status === 'evaluating' && (
          <p>Calculating your results...</p>
        )}
        {interview.status === 'finished' && (
          <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Final Score: {interview.finalScore} / 100</h3>
            <h4>Summary:</h4>
            <p>{interview.summary}</p>
          </div>
        )}
        </div>
    )}
    </div>
  );
}

export default IntervieweePage;