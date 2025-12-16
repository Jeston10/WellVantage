# WellVantage Mobile App

React Native mobile application for WellVantage gym management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Google Sign-In:
   - Update `src/context/AuthContext.js` with your Google Web Client ID
   - Update `app.json` with your iOS bundle identifier and Android package name

3. Update API configuration:
   - Update `src/config/api.js` with your backend API URL

4. Start the app:
```bash
npm start
```

## Features

- Google OAuth authentication
- Workout plan management
- Add/edit workout plans with exercises, sets, and reps
- Day-based workout organization
- Notes/diet tracking for each day
- Availability management
- Client slot booking
- Calendar integration

## Project Structure

```
src/
  ├── screens/          # Screen components
  ├── context/          # React Context providers
  ├── config/           # Configuration files
  └── components/       # Reusable components
```

