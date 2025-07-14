import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // O proxy Vite vai redirecionar
});

export default api;