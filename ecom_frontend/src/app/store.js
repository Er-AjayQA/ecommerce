import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../pages/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
