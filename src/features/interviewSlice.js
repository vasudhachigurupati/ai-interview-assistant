

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// The fetchQuestion thunk now gets the state to determine the next difficulty
export const fetchQuestion = createAsyncThunk(
  'interview/fetchQuestion',
  async (_, { getState }) => {
    const { interview } = getState();
    const { currentQuestionIndex } = interview;
    
    let difficulty = 'Easy';
    if (currentQuestionIndex >= 2 && currentQuestionIndex < 4) {
      difficulty = 'Medium';
    } else if (currentQuestionIndex >= 4) {
      difficulty = 'Hard';
    }

    const topic = currentQuestionIndex % 2 === 0 ? 'React' : 'Node.js'; // Alternate topics

   const response = await axios.post('https://ai-interview-backend.onrender.com/generate-question', {
  difficulty,
  topic,
});
    
    // Return both the question and its difficulty
    return { question: response.data.question, difficulty };
  }
);

export const getFinalEvaluation = createAsyncThunk(
  'interview/getFinalEvaluation',
  async (_, { getState }) => {
    const { interview } = getState();
    const response = await axios.post('http://localhost:3001/evaluate-interview', {
      transcript: interview.answers,
    });
    return response.data; // This will be { finalScore, summary }
  }
);

const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'active' | 'finished' | 'error'
  currentQuestion: null,
  currentQuestionIndex: 0,
  answers: [], // We'll store { question, answer } pairs here
  timerValue: 20, // The duration for the timer
  error: null,
  finalScore: null,
  summary: '',
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // This action saves the answer and advances the interview
    submitAnswer: (state, action) => {
      state.answers.push({
        question: state.currentQuestion,
        answer: action.payload,
      });
      state.currentQuestionIndex += 1;
      state.status = 'loading'; 
    },
   
    resetInterview: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestion.pending, (state) => {
        state.status = 'loading';
        state.currentQuestion = 'Generating new question...';
      })
      .addCase(fetchQuestion.fulfilled, (state, action) => {
        const { question, difficulty } = action.payload;
        state.status = 'active';
        state.currentQuestion = question;
        // Set the timer based on the question's difficulty
        if (difficulty === 'Easy') state.timerValue = 20;
        if (difficulty === 'Medium') state.timerValue = 60;
        if (difficulty === 'Hard') state.timerValue = 120;
      })
      .addCase(fetchQuestion.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(getFinalEvaluation.pending, (state) => {
        state.status = 'evaluating';
      })
      .addCase(getFinalEvaluation.fulfilled, (state, action) => {
        state.status = 'finished';
        state.finalScore = action.payload.finalScore;
        state.summary = action.payload.summary;
      })
      .addCase(getFinalEvaluation.rejected, (state) => {
        state.status = 'error';
        state.summary = 'Failed to get evaluation from AI.';
      });
  },
});

  
export const { submitAnswer, resetInterview } = interviewSlice.actions;

export default interviewSlice.reducer;