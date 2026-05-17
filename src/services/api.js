import axios from 'axios';

const API_BASE_URL = 'https://southamerica-east1-apifutebolsc.cloudfunctions.net/api-futebol';
const API_TOKEN = 'development'; // This should ideally come from secure storage

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-access-token': API_TOKEN,
  },
});

export const getTodayMatches = async () => {
  try {
    const response = await api.get('/matches/today');
    return response.data;
  } catch (error) {
    console.error('Error fetching today matches:', error);
    throw error;
  }
};

export default api;
