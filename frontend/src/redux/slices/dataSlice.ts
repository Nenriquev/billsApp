import { createSlice } from "@reduxjs/toolkit";
import { initialState, setAnalyticDataAction, setDataAction, setDatesAction, setErrorsAction, setLoadingDataAction } from "../actions/dataActions";

export const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    setData: setDataAction,
    setAnalyticData: setAnalyticDataAction,
    setLoadingData: setLoadingDataAction,
    setDates: setDatesAction,
    setErrors: setErrorsAction
  },
});

export const { setData, setLoadingData, setDates, setErrors, setAnalyticData } = dataSlice.actions;

export const dataReducer = dataSlice.reducer;
