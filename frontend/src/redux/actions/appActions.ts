import { PayloadAction } from "@reduxjs/toolkit";

export interface AppState {
  toast: {
    open: boolean;
    msg: string;
    type: "success" | "danger" | null;
  };
  modal: {
    transaction: boolean;
  };
}

export const initialState: AppState = {
  toast: {
    open: false,
    msg: "",
    type: null,
  },
  modal: {
    transaction: false,
  },
};

const setToastAction = (state: AppState, action: PayloadAction<{ open: boolean; msg: string; type: "success" | "danger" | null }>) => {
  state.toast = { ...state.toast, ...action.payload };
};

const setModalAction = (state: AppState, action: PayloadAction<{ [key: string]: boolean }>) => {
  state.modal = { ...state.modal, ...action.payload };
};

export { setToastAction, setModalAction };
