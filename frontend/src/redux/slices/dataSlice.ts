import { createSlice } from "@reduxjs/toolkit";
import { initialState, setDataAction, setLoadingDataAction } from "../actions/dataActions";

export const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    setData: setDataAction,
    setLoadingData: setLoadingDataAction
  },
});

export const { setData, setLoadingData } = dataSlice.actions;

export const dataReducer = dataSlice.reducer;
