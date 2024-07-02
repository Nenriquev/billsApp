import { configureStore } from "@reduxjs/toolkit";
import { dataReducer } from "./slices/dataSlice";
import { appReducer } from "./slices/appSlice";

export const store = configureStore({
  reducer: {
    data: dataReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
