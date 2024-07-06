import { createSlice } from "@reduxjs/toolkit";
import {
  initialState,
  setAnalyticDataAction,
  setCategoriesAction,
  setDataAction,
  setDatesAction,
  setErrorsAction,
  setLoadingDataAction,
  setSelectedTransactionAction,
} from "../actions/dataActions";

export const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    setData: setDataAction,
    setAnalyticData: setAnalyticDataAction,
    setLoadingData: setLoadingDataAction,
    setDates: setDatesAction,
    setErrors: setErrorsAction,
    setSelectedTransaction: setSelectedTransactionAction,
    setCategories: setCategoriesAction,
  },
});

export const { setData, setLoadingData, setDates, setErrors, setAnalyticData, setSelectedTransaction, setCategories } = dataSlice.actions;

export const dataReducer = dataSlice.reducer;
