import { loginApi, forgotPasswordApi } from "../../services/authService";

export const loginUser = (data) => loginApi(data);
export const forgotPassword = (data) => forgotPasswordApi(data);
