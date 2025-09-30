

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCandidate } from '../features/candidatesSlice';
import { fetchQuestion, submitAnswer, resetInterview, getFinalEvaluation } from '../features/interviewSlice';

import ResumeUpload from '../components/ResumeUpload';
import Chatbot from '../components/Chatbot';

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
  
  const [timeLeft, setTimeLeft] = useState(0);

  // This useEffect controls the overall interview flow
  useEffect(() => {
    const justStarted = step === 'interview' && interview.status === 'idle' && interview.currentQuestionIndex === 0;

  // Condition 2: We have submitted an answer and need the next question
  const needsNextQuestion = interview.status === 'loading' && interview.currentQuestionIndex < 6;

  if (justStarted || needsNextQuestion) {
    dispatch(fetchQuestion());
  }

    if (interview.currentQuestionIndex < 6 && interview.status === 'loading') {
      dispatch(fetchQuestion());
    }
    if (interview.currentQuestionIndex === 6 && interview.status !== 'evaluating' && interview.status !== 'finished') {
      dispatch(getFinalEvaluation());
      setStep('finished');
    }
  }, [step,interview.currentQuestionIndex, interview.status, dispatch]);
  
  // The stable submit function
  const handleSubmitAnswer = useCallback(() => {
    dispatch(submitAnswer(currentAnswer));
    setCurrentAnswer('');
  }, [dispatch, currentAnswer]);

  // This useEffect resets the timer when a new question arrives
  useEffect(() => {
    if (interview.status === 'active') {
      setTimeLeft(interview.timerValue);
    }
  }, [interview.status, interview.timerValue]);

  // This useEffect handles the countdown AND auto-submit
  useEffect(() => {
    if (interview.status !== 'active' || step !== 'interview') {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmitAnswer(); // Auto-submit when time is up
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, interview.status, step, handleSubmitAnswer]);


  const handleStartInterview = () => {
    dispatch(resetInterview());
    dispatch(addCandidate(candidateData));
    setStep('interview');
    
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
      {step === 'upload' && <ResumeUpload onDataExtracted={handleDataExtracted} />}
      {step === 'chat' && <Chatbot messages={messages} userInput={userInput} onUserInputChange={handleUserInputChange} onSendMessage={handleSendMessage} isWaitingForResponse={false} />}
      {step === 'confirm' && (
        <div style={{ maxWidth: '600px', margin: '20px auto', textAlign: 'center' }}>
          <h2>✅ Review and Correct Your Details</h2>
          <p style={{color: '#555'}}>If anything is wrong, please fix it below.</p>
          <div style={{ margin: '10px 0', textAlign: 'left' }}><label>Full Name:</label><input className="input" type="text" name="name" value={candidateData.name} onChange={handleConfirmationChange} /></div>
          <div style={{ margin: '10px 0', textAlign: 'left' }}><label>Email:</label><input className="input" type="email" name="email" value={candidateData.email} onChange={handleConfirmationChange} /></div>
          <div style={{ margin: '10px 0', textAlign: 'left' }}><label>Phone:</label><input className="input" type="tel" name="phone" value={candidateData.phone} onChange={handleConfirmationChange} /></div>
          <button className="button" onClick={handleStartInterview}>Confirm and Start Interview</button>
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
            disabled={interview.status !== 'active'}
          />
          <button 
            className="button"
            onClick={handleSubmitAnswer}
            disabled={interview.status !== 'active'}
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
            <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
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