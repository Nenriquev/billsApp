import { createSlice } from "@reduxjs/toolkit";
import { initialState, setDataAction, setDatesAction, setLoadingDataAction } from "../actions/dataActions";

export const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    setData: setDataAction,
    setLoadingData: setLoadingDataAction,
    setDates: setDatesAction
  },
});

export const { setData, setLoadingData, setDates } = dataSlice.actions;

export const dataReducer = dataSlice.reducer;
