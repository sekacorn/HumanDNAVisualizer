import axios from 'axios';
import { MOCK_ENABLED, mockApi } from '../mocks/mockApi';

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

const EXPLAINER_BASE_URL = import.meta.env.VITE_EXPLAINER_URL || 'http://localhost:8003';

const explainerClient = axios.create({
  baseURL: EXPLAINER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Data Upload APIs
export const uploadVCF = async (file, userId) => {
  if (MOCK_ENABLED) return mockApi.uploadVCF(file, userId);

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
  if (MOCK_ENABLED) return mockApi.uploadFHIR(fhirJson, userId);

  return apiClient.post(`/data/upload/fhir?userId=${userId}`, fhirJson);
};

export const uploadCSV = async (file, userId) => {
  if (MOCK_ENABLED) return mockApi.uploadCSV(file, userId);

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
  if (MOCK_ENABLED) return mockApi.getGenomicData(userId);

  return apiClient.get(`/data/genomic/${userId}`);
};

export const getPhenotypicData = async (userId) => {
  if (MOCK_ENABLED) return mockApi.getPhenotypicData(userId);

  return apiClient.get(`/data/phenotypic/${userId}`);
};

export const getEnvironmentalData = async (userId) => {
  if (MOCK_ENABLED) return mockApi.getEnvironmentalData(userId);

  return apiClient.get(`/data/environmental/${userId}`);
};

// AI Prediction APIs
export const predictTraits = async (userId, genomicInput) => {
  if (MOCK_ENABLED) return mockApi.predictTraits(userId, genomicInput);

  return aiClient.post(`/predict?user_id=${userId}`, genomicInput);
};

// LLM Query APIs
export const queryLLM = async (queryRequest) => {
  if (MOCK_ENABLED) return mockApi.queryLLM(queryRequest);

  return llmClient.post('/query', queryRequest);
};

// Anatomy Graph APIs
export const getAnatomyGraph = async (sampleId) => {
  if (MOCK_ENABLED) return mockApi.getAnatomyGraph(sampleId);

  return apiClient.get(`/anatomygraph/${sampleId}`);
};

export const getAnatomyGraphStats = async (sampleId) => {
  if (MOCK_ENABLED) return mockApi.getAnatomyGraphStats(sampleId);

  return apiClient.get(`/anatomygraph/${sampleId}/stats`);
};

// Sample Management APIs
export const listUserSamples = async (userId) => {
  if (MOCK_ENABLED) return mockApi.listUserSamples(userId);

  return apiClient.get(`/samples/user/${userId}`);
};

export const getSample = async (sampleId) => {
  if (MOCK_ENABLED) return mockApi.getSample(sampleId);

  return apiClient.get(`/samples/${sampleId}`);
};

export const deleteSample = async (sampleId) => {
  if (MOCK_ENABLED) return mockApi.deleteSample(sampleId);

  return apiClient.delete(`/samples/${sampleId}`);
};

// Import APIs (using existing ImportController endpoints)
export const importVCF = async (file, userId) => {
  if (MOCK_ENABLED) return mockApi.importVCF(file, userId);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  return apiClient.post('/import/vcf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const importGenotype = async (file, userId) => {
  if (MOCK_ENABLED) return mockApi.importGenotype(file, userId);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  return apiClient.post('/import/genotype', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Explainer APIs
export const explainVisualization = async (anatomyGraph, userQuestion = null, style = 'detailed') => {
  if (MOCK_ENABLED) return mockApi.explainVisualization(anatomyGraph, userQuestion, style);

  return explainerClient.post('/explain', {
    anatomyGraph,
    userQuestion,
    style
  });
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
  getAnatomyGraph,
  getAnatomyGraphStats,
  listUserSamples,
  getSample,
  deleteSample,
  importVCF,
  importGenotype,
  explainVisualization,
};
