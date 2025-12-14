# WellVantage Backend API

Backend API for WellVantage gym management application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- MongoDB connection string
- JWT secret key
- Google OAuth credentials

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Workouts
- `GET /api/workouts` - Get all workout plans
- `GET /api/workouts/:id` - Get a specific workout plan
- `POST /api/workouts` - Create a workout plan
- `PUT /api/workouts/:id` - Update a workout plan
- `DELETE /api/workouts/:id` - Delete a workout plan

### Availability
- `GET /api/availability` - Get availability slots
- `POST /api/availability` - Create availability slot
- `PUT /api/availability/:id` - Update availability slot
- `DELETE /api/availability/:id` - Delete availability slot
- `POST /api/availability/:id/book` - Book a slot

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get a specific client
- `POST /api/clients` - Create a client
- `PUT /api/clients/:id` - Update a client
- `DELETE /api/clients/:id` - Delete a client

