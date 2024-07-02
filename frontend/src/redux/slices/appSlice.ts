import { createSlice } from "@reduxjs/toolkit";
import { initialState, setToastAction } from "../actions/appActions";


export const appSlice = createSlice({
  name: "app",
  initialState: initialState,
  reducers: {
    setToast: setToastAction,
  },
});

export const { setToast } = appSlice.actions;

export const appReducer = appSlice.reducer;
