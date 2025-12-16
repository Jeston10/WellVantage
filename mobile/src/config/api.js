import axios from 'axios';
import { Platform } from 'react-native';
import { mockApiHandler } from '../services/mockApi';

// Guest mode: use mock API without any authentication
const USE_MOCK_API = true;

const getApiUrl = () => {
  if (USE_MOCK_API) {
    return 'mock-api';
  }
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api';
    }
    return 'http://192.168.100.2:5000/api';
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Always use the mock API adapter in guest mode
if (USE_MOCK_API) {
  api.defaults.adapter = async (config) => {
    try {
      let url = config.url || '';

      if (config.baseURL && url.includes(config.baseURL)) {
        url = url.replace(config.baseURL, '');
      }

      if (!url.startsWith('/')) {
        url = '/' + url;
      }

      // Ensure data is properly passed through
      // Axios might transform data, so we ensure it's available
      const requestData = config.data !== undefined ? config.data : config.transformRequest ? null : config.data;
      
      console.log('API Adapter - Config:', {
        url: config.url,
        method: config.method,
        data: config.data,
        dataType: typeof config.data,
        hasData: config.data !== undefined,
      });

      const normalizedConfig = {
        ...config,
        url,
        data: requestData,
      };

      const mockResponse = await mockApiHandler(normalizedConfig);
      if (mockResponse) {
        return Promise.resolve(mockResponse);
      }
      throw new Error('No mock handler found');
    } catch (error) {
      if (error.response) {
        return Promise.reject(error);
      }
      return Promise.reject({
        response: {
          status: 404,
          data: { message: error.message || 'Mock API: Endpoint not found' },
        },
      });
    }
  };
}

export default api;

