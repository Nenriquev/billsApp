import { PayloadAction } from "@reduxjs/toolkit";

interface dataProps {
  id: string;
  value: number;
  concept: string;
  category: string;
  date: Date;
}

export interface DataState {
  data: {
    Agua: { data: dataProps[]; total: number } | null;
    Luz: { data: dataProps[]; total: number } | null;
  };
  loading: {
    Agua: boolean;
    Luz: boolean;
  };
}

export const initialState: DataState = {
  data: {
    Agua: null,
    Luz: null,
  },
  loading: {
    Agua: true,
    Luz: true,
  },
};

const setDataAction = (state: DataState, action: PayloadAction<any>) => {
  state.data = { ...state.data, ...action.payload };
};

const setLoadingDataAction = (state: DataState, action: PayloadAction<any>) => {
  state.loading = { ...state.loading, ...action.payload };
};

export { setDataAction, setLoadingDataAction };
