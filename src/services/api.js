import axios from 'axios';
import todayMatchesJson from '../json/matches-today.json';
import teamsJson from '../json/teams.json';
import matchesCriciuma from '../json/matches-team-cec.json'

const API_BASE_URL = 'https://api-futebol-qqpfwbjxua-rj.a.run.app';
const API_TOKEN = 'development'; // Replace with a valid token
const MODE = process.env.EXPO_PUBLIC_ENVIRONMENT || "dev"
const DEVMODE = MODE === "dev"

DEVMODE && console.info("DEVELOPMENT MODE");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-access-token': API_TOKEN,
  },
});

export const getTodayMatches = async () => {
  if (DEVMODE) return todayMatchesJson;
  try {
    const response = await api.get('/matches/today');
    return response.data;
  } catch (error) {
    console.error('Error fetching today matches:', error);
    throw error;
  }
};

export const getTeams = async (params = {}) => {
  if (DEVMODE) return teamsJson;
  try {
    const response = await api.get('/teams', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const getMatchesByTeam = async (teamName) => {
  if (DEVMODE) return matchesCriciuma;
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

export const verifyUser = async (userData) => {
  try {
    const response = await api.post('/user/verify', userData);
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

export const updateUserTeam = async (email, teamData) => {
  try {
    const response = await api.post('/user/update-team', { email, team: teamData });
    return response.data;
  } catch (error) {
    console.error('Error updating user team:', error);
    throw error;
  }
};

export default api;
