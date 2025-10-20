import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
const LLM_BASE_URL = import.meta.env.VITE_LLM_URL || 'http://localhost:8002';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const llmClient = axios.create({
  baseURL: LLM_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Data Upload APIs
export const uploadVCF = async (file, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  return apiClient.post('/data/upload/vcf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadFHIR = async (fhirJson, userId) => {
  return apiClient.post(`/data/upload/fhir?userId=${userId}`, fhirJson);
};

export const uploadCSV = async (file, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  return apiClient.post('/data/upload/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Data Retrieval APIs
export const getGenomicData = async (userId) => {
  return apiClient.get(`/data/genomic/${userId}`);
};

export const getPhenotypicData = async (userId) => {
  return apiClient.get(`/data/phenotypic/${userId}`);
};

export const getEnvironmentalData = async (userId) => {
  return apiClient.get(`/data/environmental/${userId}`);
};

// AI Prediction APIs
export const predictTraits = async (userId, genomicInput) => {
  return aiClient.post(`/predict?user_id=${userId}`, genomicInput);
};

// LLM Query APIs
export const queryLLM = async (queryRequest) => {
  return llmClient.post('/query', queryRequest);
};

export default {
  uploadVCF,
  uploadFHIR,
  uploadCSV,
  getGenomicData,
  getPhenotypicData,
  getEnvironmentalData,
  predictTraits,
  queryLLM,
};
