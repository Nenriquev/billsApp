import { createSlice } from "@reduxjs/toolkit";
import { initialState, setCounterAction } from "../actions/counterActions";

export const counterSlice = createSlice({
  name: "counter",
  initialState: initialState,
  reducers: {
    setCounter: setCounterAction,
  },
});

export const { setCounter } = counterSlice.actions;

export const counterReducer = counterSlice.reducer;
