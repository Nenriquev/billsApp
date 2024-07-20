import { PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "../../types";

interface dataProps {
  dimentions: string[];
  source: any;
  series: any;
}

export interface DataState {
  data: Array<any> | null;
  categories: Array<any> | null;
  selectedTransaction: Transaction | null;
  analytics: {
    Alquiler: { data: dataProps[]; total: number } | null;
    Agua: { data: dataProps[]; total: number } | null;
    Luz: { data: dataProps[]; total: number } | null;
    Gas: { data: dataProps[]; total: number } | null;
    Seguro: { data: dataProps[]; total: number } | null;
    Teléfono: { data: dataProps[]; total: number } | null;
    Entretenimiento: { data: dataProps[]; total: number } | null;
    Supermercados: { data: { dimentions: string[]; source: any }; total: number } | null;
    Otros: { data: { dimentions: string[]; source: any }; total: number } | null;
  };
  loading: {
    data: boolean;
    categories: boolean;
    Alquiler: boolean;
    Agua: boolean;
    Luz: boolean;
    Gas: boolean;
    Seguro: boolean;
    Teléfono: boolean;
    Supermercados: boolean;
    Entretenimiento: boolean;
    Otros: boolean;
  };
  dates: {
    from: string;
    to: string;
  };
  errors: {
    uploadSheet: string | null;
  };
}

export const initialState: DataState = {
  data: null,
  categories: null,
  selectedTransaction: null,
  analytics: {
    Alquiler: null,
    Agua: null,
    Luz: null,
    Gas: null,
    Seguro: null,
    Teléfono: null,
    Entretenimiento: null,
    Supermercados: null,
    Otros: null,
  },
  loading: {
    data: true,
    categories: true,
    Alquiler: true,
    Agua: true,
    Luz: true,
    Gas: true,
    Seguro: true,
    Teléfono: true,
    Supermercados: true,
    Entretenimiento: true,
    Otros: true,
  },
  dates: {
    from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    to: new Date(new Date().getFullYear(), 11, 31).toISOString(),
  },
  errors: {
    uploadSheet: null,
  },
};

const setDataAction = (state: DataState, action: PayloadAction<any>) => {
  state.data = action.payload;
};

const setCategoriesAction = (state: DataState, action: PayloadAction<any>) => {
  state.categories = action.payload;
};

const setSelectedTransactionAction = (state: DataState, action: PayloadAction<any>) => {
  state.selectedTransaction = action.payload;
};

const setAnalyticDataAction = (state: DataState, action: PayloadAction<any>) => {
  state.analytics = { ...state.analytics, ...action.payload };
};

const setLoadingDataAction = (state: DataState, action: PayloadAction<any>) => {
  state.loading = { ...state.loading, ...action.payload };
};

const setDatesAction = (state: DataState, action: PayloadAction<{ from: string; to: string }>) => {
  state.dates = action.payload;
};

const setErrorsAction = (state: DataState, action: PayloadAction<any>) => {
  state.errors = { ...state.errors, ...action.payload };
};

export {
  setAnalyticDataAction,
  setLoadingDataAction,
  setDatesAction,
  setErrorsAction,
  setDataAction,
  setSelectedTransactionAction,
  setCategoriesAction,
};
