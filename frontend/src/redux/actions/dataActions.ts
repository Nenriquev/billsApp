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
    Alquiler: { data: dataProps[]; total: number } | null;
    Agua: { data: dataProps[]; total: number } | null;
    Luz: { data: dataProps[]; total: number } | null;
    Gas: { data: dataProps[]; total: number } | null;
    Seguro: { data: dataProps[]; total: number } | null;
    Teléfono: { data: dataProps[]; total: number } | null;
    Supermercados: { data: { dimentions: string[]; source: any }; total: number } | null;
  };
  loading: {
    Alquiler: boolean;
    Agua: boolean;
    Luz: boolean;
    Gas: boolean;
    Seguro: boolean;
    Teléfono: boolean;
    Supermercados: boolean;
  };
  dates: {
    from: string;
    to: string;
  };
}

export const initialState: DataState = {
  data: {
    Alquiler: null,
    Agua: null,
    Luz: null,
    Gas: null,
    Seguro: null,
    Teléfono: null,
    Supermercados: null,
  },
  loading: {
    Alquiler: true,
    Agua: true,
    Luz: true,
    Gas: true,
    Seguro: true,
    Teléfono: true,
    Supermercados: true,
  },
  dates: {
    from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    to: new Date(new Date().getFullYear(), 11, 31).toISOString(),
  },
};

const setDataAction = (state: DataState, action: PayloadAction<any>) => {
  state.data = { ...state.data, ...action.payload };
};

const setLoadingDataAction = (state: DataState, action: PayloadAction<any>) => {
  state.loading = { ...state.loading, ...action.payload };
};

const setDatesAction = (state: DataState, action: PayloadAction<{ from: string; to: string }>) => {
  state.dates = action.payload;
};

export { setDataAction, setLoadingDataAction, setDatesAction };
