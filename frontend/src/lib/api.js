import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`;

let accessToken = null;
let sessionLostHandler = null;

export const setAccessToken = (token) => {
  accessToken = token ?? null;
};

export const getAccessToken = () => accessToken;

export const onSessionLost = (handler) => {
  sessionLostHandler = handler;
};

export const api = axios.create({ baseURL, withCredentials: true });

const plain = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshInFlight = null;

export const refreshSession = () => {
  refreshInFlight ??= plain
    .post('/auth/refresh')
    .then((response) => {
      const { accessToken: token, user } = response.data.data;
      setAccessToken(token);
      return user;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

const HARD_LOGOUT_CODES = new Set([
  'REFRESH_TOKEN_REUSED',
  'REFRESH_TOKEN_REVOKED',
  'REFRESH_TOKEN_EXPIRED',
  'REFRESH_TOKEN_MISSING',
  'REFRESH_TOKEN_INVALID',
  'ACCOUNT_DISABLED',
  'ACCOUNT_UNAVAILABLE',
]);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    if (status !== 401 || !request || request.__retried || request.url?.includes('/auth/refresh')) {
      if (HARD_LOGOUT_CODES.has(code)) sessionLostHandler?.(code);
      return Promise.reject(error);
    }

    request.__retried = true;

    try {
      await refreshSession();
      return api(request);
    } catch (refreshError) {
      setAccessToken(null);
      sessionLostHandler?.(refreshError.response?.data?.error?.code ?? 'SESSION_EXPIRED');
      return Promise.reject(error);
    }
  },
);

export const apiError = (error) => {
  const payload = error?.response?.data?.error;
  return {
    code: payload?.code ?? 'NETWORK_ERROR',
    message: payload?.message ?? 'Something went wrong. Please check your connection and try again.',
    details: payload?.details ?? null,
  };
};

export const fieldErrors = (error) => {
  const { details } = apiError(error);
  if (!Array.isArray(details)) return {};
  return details.reduce((acc, item) => {
    if (item?.field && !acc[item.field]) acc[item.field] = item.message;
    return acc;
  }, {});
};

export const googleSignInUrl = `${baseURL}/auth/google`;
