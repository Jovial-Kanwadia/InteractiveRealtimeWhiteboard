// src/app/api.ts
import axios from 'axios';
import { Store } from '@reduxjs/toolkit';


axios.defaults.withCredentials = true;

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true, // This ensures cookies are sent with requests
});

export const initializeApiInterceptors = (_store: Store, token: string | null) => {
    // Request interceptor to add the access token to headers
    api.interceptors.request.use(
        (config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // console.log('Request Config:', config);
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle token refresh
    api.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            const status = error.response ? error.response.status : null;

            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const response = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/users/refresh-token`,
                        {},
                        { withCredentials: true } // Ensure cookies are sent
                    );
                    const { accessToken } = response.data;
                    // store.dispatch(setAccessToken(accessToken));
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // store.dispatch(logoutSuccess());
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;
