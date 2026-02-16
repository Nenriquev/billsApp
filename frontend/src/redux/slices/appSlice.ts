import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModalState, ToastState } from "../../types";
import {
  updateTransaction,
  deleteTransaction,
  uploadSheet,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../thunks/dataThunks";

interface AppState {
  toast: ToastState;
  modal: ModalState;
}

const initialState: AppState = {
  toast: {
    open: false,
    msg: "",
    type: null,
  },
  modal: {
    transaction: false,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setToast(state, action: PayloadAction<ToastState>) {
      state.toast = action.payload;
    },
    setModal(state, action: PayloadAction<Partial<ModalState>>) {
      state.modal = { ...state.modal, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateTransaction.fulfilled, (state) => {
        state.modal.transaction = false;
        state.toast = { open: true, msg: "Transacción actualizada", type: "success" };
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.toast = {
          open: true,
          msg: action.payload || "Error al actualizar",
          type: "danger",
        };
      })

      .addCase(deleteTransaction.fulfilled, (state) => {
        state.modal.transaction = false;
        state.toast = { open: true, msg: "Transacción eliminada", type: "success" };
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.toast = {
          open: true,
          msg: action.payload || "Error al eliminar transacción",
          type: "danger",
        };
      })
      .addCase(uploadSheet.fulfilled, (state, action) => {
        state.toast = {
          open: true,
          msg: action.payload.message || "Archivo subido exitosamente",
          type: "success",
        };
      })
      .addCase(uploadSheet.rejected, (state, action) => {
        state.toast = {
          open: true,
          msg: action.payload || "Error al subir archivo",
          type: "danger",
        };
      })

      .addCase(createCategory.fulfilled, (state) => {
        state.toast = { open: true, msg: "Categoría creada correctamente", type: "success" };
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.toast = { open: true, msg: action.payload || "Error al crear categoría", type: "danger" };
      })

      .addCase(updateCategory.fulfilled, (state) => {
        state.toast = { open: true, msg: "Categoría actualizada", type: "success" };
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.toast = { open: true, msg: action.payload || "Error al actualizar categoría", type: "danger" };
      })

      .addCase(deleteCategory.fulfilled, (state) => {
        state.toast = { open: true, msg: "Categoría eliminada", type: "success" };
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.toast = { open: true, msg: action.payload || "Error al eliminar categoría", type: "danger" };
      });
  },
});

export const { setToast, setModal } = appSlice.actions;
export const appReducer = appSlice.reducer;
