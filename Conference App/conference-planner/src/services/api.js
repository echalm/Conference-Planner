import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

export const getAllTalks = async () => {
  const response = await axios.get(`${BASE_URL}/talks`);
  return response.data;
};

export const getTalksBySpeaker = async (speaker) => {
  const response = await axios.get(`${BASE_URL}/talks/speaker/${speaker}`);
  return response.data;
};

export const rateTalk = async (id, rating) => {
  const response = await axios.post(`${BASE_URL}/talks/rate/${id}/${rating}`);
  return response.data;
};

