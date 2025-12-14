# WellVantage

A comprehensive gym management application built with Node.js backend and React Native mobile app.

## Project Structure

```
WellVantage/
├── backend/          # Node.js/Express API
├── mobile/          # React Native mobile app
├── Images/          # Design reference images
└── information.md   # Project requirements and specifications
```

## Features

### Authentication
- Google OAuth sign-up/login
- JWT-based authentication
- User session management

### Workout Management
- Create custom workout plans
- Add multiple workout days
- Define exercises with sets and reps
- Add diet notes for each day
- Delete workout plans

### Availability Management
- Set trainer availability slots
- Calendar-based date selection
- Time slot management
- Repeat sessions option

### Client Management
- Book client slots
- Track remaining sessions
- Session expiry tracking

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- MongoDB connection string
- JWT secret
- Google OAuth credentials

5. Start the server:
```bash
npm run dev
```

### Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure Google Sign-In:
   - Update `src/context/AuthContext.js` with your Google Web Client ID
   - Update `app.json` with your app identifiers

4. Update API configuration in `src/config/api.js`

5. Start the app:
```bash
npm start
```

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Google OAuth

### Mobile
- React Native
- Expo
- React Navigation
- AsyncStorage
- Google Sign-In
- React Native Calendars

## API Endpoints

See `backend/README.md` for detailed API documentation.

## Design Reference

The app design is based on the Figma designs provided in the `Images/` folder and specifications in `information.md`.

## License

ISC

