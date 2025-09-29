

import { createSlice } from '@reduxjs/toolkit';
import { getFinalEvaluation } from './interviewSlice';

const initialState = {
  list: [],
};

export const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      const newCandidate = {
        id: `candidate_${Date.now()}`,
        ...action.payload,
        interviewData: [], // Initialize with an empty array
        answers: [],       // Initialize with an empty array
        finalScore: null,
        summary: null,
      };
      state.list.push(newCandidate);
    },
  },
  extraReducers: (builder) => {
    // This listens for when the getFinalEvaluation action is successful
    builder.addCase(getFinalEvaluation.fulfilled, (state, action) => {
      // Find the last candidate added to the list (the current one)
      const currentCandidate = state.list[state.list.length - 1];

      if (currentCandidate) {
        console.log("Saving final score to candidate:", currentCandidate.name);
        // action.payload is { finalScore, summary }
        currentCandidate.finalScore = action.payload.finalScore;
        currentCandidate.summary = action.payload.summary;
       
        currentCandidate.answers = action.meta.arg;
      }
    });
  },
});

export const { addCandidate } = candidatesSlice.actions;

export default candidatesSlice.reducer;