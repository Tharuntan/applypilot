// Production / default build. Override apiBaseUrl at deploy time with the real backend URL.
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8080/api',
};
