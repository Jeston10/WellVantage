// Mock API service for development without backend
// This file provides mock data responses for all API endpoints

// Store mock users dynamically (simulates database)
const mockUsers = new Map();

// Default mock user
const defaultMockUser = {
  id: 'mock-user-123',
  email: 'test@wellvantage.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  googleId: 'mock-google-id-123',
};

mockUsers.set('mock-google-id-123', defaultMockUser);
mockUsers.set('test@wellvantage.com', defaultMockUser);

// Helper to extract user info from Google ID token (mock)
const extractUserFromToken = (idToken) => {
  // In real scenario, we'd decode the JWT token
  // For mock, we'll create a user based on token hash
  try {
    // Try to extract email from token if it's a real token
    // For mock, we'll create a unique user per token
    const tokenHash = idToken.substring(0, 20);
    const existingUser = Array.from(mockUsers.values()).find(
      (u) => u.googleId === tokenHash
    );
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create new mock user
    const newUser = {
      id: `mock-user-${Date.now()}`,
      email: `user-${tokenHash}@example.com`,
      name: 'Google User',
      picture: 'https://via.placeholder.com/150',
      googleId: tokenHash,
    };
    
    mockUsers.set(tokenHash, newUser);
    mockUsers.set(newUser.email, newUser);
    
    return newUser;
  } catch (error) {
    // Fallback to default user
    return defaultMockUser;
  }
};

// Mock workout plans (user-specific)
const mockWorkoutPlans = new Map();
const defaultWorkoutPlans = [
  {
    _id: '1',
    name: "Beginner's Workout - 3 Days",
    userId: 'mock-user-123',
    days: [
      {
        dayNumber: 1,
        dayName: 'Chest',
        exercises: [
          { name: 'Chest', sets: '10', reps: '5-8' },
          { name: 'Bench Press', sets: '8', reps: '3' },
        ],
        notes: 'Focus on form',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: "Beginner's Full Body - 1 Day",
    userId: 'mock-user-123',
    days: [
      {
        dayNumber: 1,
        dayName: 'Full Body',
        exercises: [
          { name: 'Squats', sets: '3', reps: '10' },
          { name: 'Push-ups', sets: '3', reps: '10' },
        ],
        notes: 'Full body workout',
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

// Initialize default workout plans
defaultWorkoutPlans.forEach((plan) => {
  mockWorkoutPlans.set(plan._id, plan);
});

// Mock availability slots
// Initialize with today's date to ensure slots are visible
const today = new Date();
const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

const mockAvailability = [
  {
    _id: '1',
    userId: 'mock-user-123',
    date: today.toISOString(), // Full ISO string for storage
    startTime: '11:00 AM',
    endTime: '11:45 AM',
    sessionName: 'PT',
    repeatSessions: false,
    isBooked: false,
  },
  {
    _id: '2',
    userId: 'mock-user-123',
    date: today.toISOString(),
    startTime: '5:00 PM',
    endTime: '5:30 PM',
    sessionName: 'PT',
    repeatSessions: false,
    isBooked: false,
  },
  {
    _id: '3',
    userId: 'mock-user-123',
    date: today.toISOString(),
    startTime: '9:00 AM',
    endTime: '9:45 AM',
    sessionName: 'PT',
    repeatSessions: false,
    isBooked: false,
  },
];

// Mock clients
const mockClients = [
  {
    _id: '1',
    trainerId: 'mock-user-123',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    phone: '+1234567890',
    sessionsRemaining: 20,
    sessionsExpiryDate: new Date('2026-06-24').toISOString(),
  },
];

// Generate mock JWT token
const generateMockToken = () => {
  return 'mock-jwt-token-' + Date.now();
};

// Mock API responses
const mockApi = {
  // Auth endpoints
  '/auth/google': {
    POST: (data) => {
      const { idToken } = data;
      console.log('Mock: Google Sign-In', { idToken: idToken?.substring(0, 20) + '...' });
      
      // Extract or create user from token (simulates backend user creation)
      const user = extractUserFromToken(idToken || 'default-token');
      
      // Generate unique token for this user
      const token = generateMockToken();
      
      // Store token-user mapping (in real app, this would be in backend)
      console.log(`Mock: User ${user.email} signed in/signed up`);
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      };
    },
  },
  '/auth/me': {
    GET: () => {
      // Return default user for now (in real app, would decode token)
      return defaultMockUser;
    },
  },

  // Workout endpoints
  '/workouts': {
    GET: () => {
      const plans = Array.from(mockWorkoutPlans.values());
      console.log('GET /workouts: Returning', plans.length, 'plans');
      return plans;
    },
    POST: (data) => {
      console.log('POST /workouts: Received data:', data);
      console.log('POST /workouts: Data type:', typeof data);
      console.log('POST /workouts: Data.name:', data?.name);
      console.log('POST /workouts: Data.name type:', typeof data?.name);
      console.log('POST /workouts: Data.name trimmed:', data?.name?.trim());
      
      // Check if data exists and has name property
      if (!data) {
        console.error('POST /workouts: No data received');
        throw {
          response: {
            status: 400,
            data: { message: 'Request data is required' },
          },
        };
      }
      
      // Check if name exists and is not empty after trimming
      if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        console.error('POST /workouts: Invalid or missing name:', data.name);
        throw {
          response: {
            status: 400,
            data: { message: 'Workout plan name is required' },
          },
        };
      }
      
      const newPlan = {
        _id: String(Date.now()),
        name: data.name.trim(),
        days: data.days || [],
        userId: 'mock-user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockWorkoutPlans.set(newPlan._id, newPlan);
      console.log('POST /workouts: Created plan with ID:', newPlan._id);
      console.log('POST /workouts: Plan name:', newPlan.name);
      console.log('Total plans now:', mockWorkoutPlans.size);
      return newPlan;
    },
  },
  '/workouts/:id': {
    GET: (data, params = {}, query = {}) => {
      // For GET requests, params come as the second argument from pattern matching
      const { id } = params || {};
      return mockWorkoutPlans.get(id) || null;
    },
    PUT: (data, params = {}, query = {}) => {
      // For PUT requests, params come as the second argument from pattern matching
      const { id } = params || {};
      const plan = mockWorkoutPlans.get(id);
      if (plan) {
        const updatedPlan = { ...plan, ...data, updatedAt: new Date().toISOString() };
        mockWorkoutPlans.set(id, updatedPlan);
        return updatedPlan;
      }
      return null;
    },
    DELETE: (data, params = {}, query = {}) => {
      // For DELETE requests, params come as the second argument from pattern matching
      const { id } = params || {};
      if (!id) {
        throw {
          response: {
            status: 400,
            data: { message: 'Workout plan id is required' },
          },
        };
      }
      
      if (mockWorkoutPlans.has(id)) {
        mockWorkoutPlans.delete(id);
        return { message: 'Workout plan deleted successfully' };
      }
      throw {
        response: {
          status: 404,
          data: { message: 'Workout plan not found' },
        },
      };
    },
  },

  // Availability endpoints
  '/availability': {
    GET: (data, params, query) => {
      console.log('GET /availability called with query:', query);
      // Filter by date if query parameter is provided
      if (query && query.date) {
        const selectedDate = query.date;
        console.log('Filtering slots for date:', selectedDate);
        // Filter slots that match the selected date (format: YYYY-MM-DD)
        const filtered = mockAvailability.filter((slot) => {
          // Handle both ISO string and date object
          let slotDate;
          if (typeof slot.date === 'string') {
            slotDate = slot.date.split('T')[0]; // Extract YYYY-MM-DD from ISO string
          } else {
            slotDate = new Date(slot.date).toISOString().split('T')[0];
          }
          const matches = slotDate === selectedDate;
          console.log(`Slot ${slot._id}: ${slotDate} === ${selectedDate}? ${matches}`);
          return matches;
        });
        console.log(`Found ${filtered.length} slots for date ${selectedDate}`);
        return filtered;
      }
      console.log('No date filter, returning all slots:', mockAvailability.length);
      return mockAvailability;
    },
    POST: (data) => {
      const newSlot = {
        _id: String(mockAvailability.length + 1),
        ...data,
        userId: 'mock-user-123',
        isBooked: false,
        createdAt: new Date().toISOString(),
      };
      mockAvailability.push(newSlot);
      return newSlot;
    },
  },
  '/availability/:id': {
    PUT: (data, params = {}, query = {}) => {
      // For PUT requests, params come as the second argument from pattern matching
      const { id } = params || {};
      if (!id) {
        throw {
          response: {
            status: 400,
            data: { message: 'Slot id is required' },
          },
        };
      }

      const index = mockAvailability.findIndex((a) => a._id === id);
      if (index !== -1) {
        mockAvailability[index] = { ...mockAvailability[index], ...data };
        return mockAvailability[index];
      }
      return null;
    },
    DELETE: (data, params = {}, query = {}) => {
      // For DELETE requests, params come as the second argument from pattern matching
      // Pattern matching calls: handler(config.data, params, query)
      // So params contains the route parameters like {id: '123'}
      const { id } = params || {};
      
      console.log('DELETE /availability/:id called');
      console.log('Data:', data);
      console.log('Params:', params);
      console.log('ID from params:', id);
      
      if (!id) {
        throw {
          response: {
            status: 400,
            data: { message: 'Slot id is required' },
          },
        };
      }

      console.log('Available slots:', mockAvailability.map(s => ({ id: s._id, booked: s.isBooked })));
      
      const index = mockAvailability.findIndex((a) => a._id === id);
      console.log('Found slot at index:', index);
      
      if (index !== -1) {
        const deletedSlot = mockAvailability[index];
        mockAvailability.splice(index, 1);
        console.log('Slot deleted successfully:', deletedSlot._id);
        return { message: 'Availability slot deleted successfully' };
      }
      
      console.log('Slot not found with id:', id);
      throw {
        response: {
          status: 404,
          data: { message: 'Availability slot not found' },
        },
      };
    },
  },
  '/availability/:id/book': {
    POST: (data, params = {}, query = {}) => {
      // For POST requests, params come as the second argument from pattern matching
      const { id } = params || {};
      const slot = mockAvailability.find((a) => a._id === id);
      if (!slot) {
        throw {
          response: {
            status: 404,
            data: { message: 'Availability slot not found' },
          },
        };
      }
      if (slot.isBooked) {
        throw {
          response: {
            status: 400,
            data: { message: 'Slot is already booked' },
          },
        };
      }
      slot.isBooked = true;
      slot.bookedBy = 'mock-user-123';
      return slot;
    },
  },

  // Client endpoints
  '/clients': {
    GET: () => {
      return mockClients;
    },
    POST: (data) => {
      const newClient = {
        _id: String(mockClients.length + 1),
        ...data,
        trainerId: 'mock-user-123',
        createdAt: new Date().toISOString(),
      };
      mockClients.push(newClient);
      return newClient;
    },
  },
  '/clients/:id': {
    GET: (data, params = {}, query = {}) => {
      // For GET requests, params come as the second argument from pattern matching
      const { id } = params || {};
      return mockClients.find((c) => c._id === id) || null;
    },
    PUT: (data, params = {}, query = {}) => {
      // For PUT requests, params come as the second argument from pattern matching
      const { id } = params || {};
      const index = mockClients.findIndex((c) => c._id === id);
      if (index !== -1) {
        mockClients[index] = { ...mockClients[index], ...data };
        return mockClients[index];
      }
      return null;
    },
    DELETE: (data, params = {}, query = {}) => {
      // For DELETE requests, params come as the second argument from pattern matching
      const { id } = params || {};
      if (!id) {
        throw {
          response: {
            status: 400,
            data: { message: 'Client id is required' },
          },
        };
      }
      
      const index = mockClients.findIndex((c) => c._id === id);
      if (index !== -1) {
        mockClients.splice(index, 1);
        return { message: 'Client deleted successfully' };
      }
      throw {
        response: {
          status: 404,
          data: { message: 'Client not found' },
        },
      };
    },
  },
};

// Helper to match route pattern
const matchRoute = (url, pattern) => {
  const urlParts = url.split('/').filter((p) => p);
  const patternParts = pattern.split('/').filter((p) => p);

  if (urlParts.length !== patternParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].substring(1)] = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return null;
    }
  }
  return params;
};

// Mock API handler for axios adapter
export const mockApiHandler = async (config) => {
  // URL should already be normalized by the adapter
  // It should be in format: '/availability' or '/availability?date=...'
  let url = config.url || '';
  
  // Remove '/api' prefix if present (in case it wasn't normalized)
  if (url.startsWith('/api')) {
    url = url.replace('/api', '');
  }
  
  // Ensure it starts with '/'
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  
  const method = config.method.toUpperCase();

  // Extract query parameters manually (URLSearchParams may not be available in React Native)
  let query = {};
  if (url.includes('?')) {
    const [baseUrl, queryString] = url.split('?');
    url = baseUrl;
    
    // Manual query string parsing
    if (queryString) {
      queryString.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        if (key) {
          query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        }
      });
    }
  }
  
  console.log('Mock API Handler:', { 
    originalUrl: config.url, 
    baseURL: config.baseURL,
    processedUrl: url, 
    method, 
    query,
    requestData: config.data,
    requestDataType: typeof config.data,
    availableRoutes: Object.keys(mockApi)
  });

  // Small delay to simulate network
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Try exact match first (without query params)
  if (mockApi[url] && mockApi[url][method]) {
    console.log(`Found exact match for ${url}`);
    console.log('Full config object:', JSON.stringify(config, null, 2));
    console.log('Request data:', config.data);
    console.log('Request data type:', typeof config.data);
    console.log('Config keys:', Object.keys(config));
    
    // Try to get data from various possible locations
    let requestData = config.data;
    if (!requestData && config.body) {
      requestData = config.body;
    }
    if (!requestData && config.params) {
      requestData = config.params;
    }
    if (!requestData) {
      requestData = {};
    }
    
    // If data is a string, try to parse it as JSON
    if (typeof requestData === 'string' && requestData.trim().startsWith('{')) {
      try {
        requestData = JSON.parse(requestData);
        console.log('Parsed JSON string to object:', requestData);
      } catch (e) {
        console.error('Failed to parse data as JSON:', e);
      }
    }
    
    // Ensure requestData is an object
    if (!requestData || typeof requestData !== 'object') {
      console.error('Request data is not an object:', requestData);
      requestData = {};
    }
    
    console.log('Final requestData being passed:', requestData);
    console.log('Final requestData.name:', requestData?.name);
    console.log('Final requestData keys:', Object.keys(requestData));
    
    try {
      const response = mockApi[url][method](requestData, {}, query);
      if (response === null) {
        throw {
          response: {
            status: 404,
            data: { message: 'Not found' },
          },
        };
      }
      return {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    } catch (error) {
      // If handler throws an error, propagate it
      if (error.response) {
        throw error;
      }
      // Otherwise wrap it
      throw {
        response: {
          status: error.status || 500,
          data: { message: error.message || 'Internal server error' },
        },
      };
    }
  }

  // Try pattern matching
  for (const pattern in mockApi) {
    const params = matchRoute(url, pattern);
    if (params) {
      const handler = mockApi[pattern][method];
      if (handler) {
        try {
          const response = handler(config.data, params, query);
          if (response === null) {
            throw {
              response: {
                status: 404,
                data: { message: 'Not found' },
              },
            };
          }
          return {
            data: response,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        } catch (error) {
          // If handler throws an error, propagate it
          if (error.response) {
            throw error;
          }
          // Otherwise wrap it
          throw {
            response: {
              status: error.status || 500,
              data: { message: error.message || 'Internal server error' },
            },
          };
        }
      }
    }
  }

  // No matching route found
  console.error('No matching route found:', {
    url,
    method,
    query,
    availableRoutes: Object.keys(mockApi),
  });
  throw {
    response: {
      status: 404,
      data: { 
        message: `Route not found: ${method} ${url}`,
        availableRoutes: Object.keys(mockApi),
      },
    },
  };
};

export default mockApi;

