import { PayloadAction } from "@reduxjs/toolkit";

export interface CounterState {
  value: number;
}

export const initialState: CounterState = {
  value: 0,
};

const setCounterAction = (state: CounterState, action: PayloadAction<number>) => {
  state.value = action.payload;
};

export { setCounterAction };
