import { PayloadAction } from "@reduxjs/toolkit";

interface dataProps {
  id: string;
  value: number;
  concept: string;
  category: string;
  date: Date;
}

export interface AppState {
  toast: {
    open: boolean;
    msg: string;
    type: "success" | "danger" | null;
  };
}

export const initialState: AppState = {
  toast: {
    open: false,
    msg: "",
    type: null,
  },
};

const setToastAction = (state: AppState, action: PayloadAction<{ open: boolean; msg: string; type: "success" | "danger" | null }>) => {
  state.toast = { ...state.toast, ...action.payload };
};

export { setToastAction };
