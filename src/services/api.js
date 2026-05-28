import axios from 'axios';

const API_BASE_URL = 'https://api-futebol-qqpfwbjxua-rj.a.run.app';
const API_TOKEN = 'development'; // Replace with a valid token

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

export const getTeams = async (params = {}) => {
  try {
    const response = await api.get('/teams', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const getMatchesByTeam = async (teamName) => {
  try {
    const response = await api.get(`/matches/team/${encodeURIComponent(teamName)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching matches for ${teamName}:`, error);
    throw error;
  }
};

export const getTournaments = async () => {
  try {
    const response = await api.get('/tournaments');
    return response.data;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }
};

export const getMatchesByTournament = async (tournamentName) => {
  try {
    const response = await api.get(`/matches/tournament/${encodeURIComponent(tournamentName)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching matches for ${tournamentName}:`, error);
    throw error;
  }
};

export default api;
