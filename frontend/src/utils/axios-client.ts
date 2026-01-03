import axios from "axios";
import { getAuthToken } from "./auth";

type BackendClientConfig = {
  withAuth?: boolean;
};

export const backendClient = (config?: BackendClientConfig) => {
  const { withAuth = true } = config || {};
  const client = axios.create({
    // baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    baseURL:'https://secj3104-01-applications-development-2526.onrender.com',
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(withAuth && { Authorization: `Bearer ${getAuthToken()}` }),
    },
  });

  return client;
};
