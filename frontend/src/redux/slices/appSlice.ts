import { createSlice } from "@reduxjs/toolkit";
import { initialState, setModalAction, setToastAction } from "../actions/appActions";


export const appSlice = createSlice({
  name: "app",
  initialState: initialState,
  reducers: {
    setToast: setToastAction,
    setModal: setModalAction
  },
});

export const { setToast, setModal } = appSlice.actions;

export const appReducer = appSlice.reducer;
