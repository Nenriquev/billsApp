import { createSlice } from "@reduxjs/toolkit";
import { initialState, setDataAction, setDatesAction, setErrorsAction, setLoadingDataAction } from "../actions/dataActions";

export const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    setData: setDataAction,
    setLoadingData: setLoadingDataAction,
    setDates: setDatesAction,
    setErrors: setErrorsAction
  },
});

export const { setData, setLoadingData, setDates, setErrors } = dataSlice.actions;

export const dataReducer = dataSlice.reducer;
