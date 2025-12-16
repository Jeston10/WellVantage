# WellVantage

A comprehensive gym management application built with Node.js backend and React Native mobile app. Manage workouts, trainer availability, and client bookings all in one place.

## Project Structure

```
WellVantage/
├── backend/                    # Node.js/Express API
│   ├── middleware/            # Authentication middleware
│   ├── models/                # MongoDB models (User, WorkoutPlan, Availability, Client)
│   ├── routes/                # API route handlers
│   ├── server.js              # Express server entry point
│   └── package.json
│
├── mobile/                     # React Native mobile app (Expo)
│   ├── src/
│   │   ├── components/        # Reusable components (Sidebar)
│   │   ├── config/            # API configuration
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── screens/           # Screen components
│   │   │   ├── AuthScreen.js
│   │   │   ├── WorkoutManagementScreen.js
│   │   │   ├── AddWorkoutPlanScreen.js
│   │   │   ├── SetAvailabilityScreen.js
│   │   │   └── BookSlotsScreen.js
│   │   ├── services/          # API services (mockApi)
│   │   └── utils/             # Utility functions (responsive.js)
│   ├── assets/                # App assets (icons, images)
│   ├── App.js                 # Root component
│   └── package.json
│
└── README.md                   # This file
```

## Features

### Authentication
- **Guest Mode**: Continue as guest without registration
- Simple and streamlined authentication flow

### Workout Management
- Create custom workout plans with multiple days
- Add exercises with sets and reps for each day
- Add diet notes for each workout day
- Delete workout plans
- Responsive design for all device sizes

### Availability Management
- Set trainer availability slots
- Calendar-based date selection
- Time slot management (start and end times)
- Repeat sessions option
- Visual calendar interface

### Slot Booking
- View available slots
- Book individual or multiple slots
- Bulk booking functionality
- Delete booked slots
- Calendar integration for date selection

### Responsive Design
- Fully responsive across all devices:
  - Android phones (all sizes)
  - iOS phones (all sizes)
  - Tablets (Android & iOS)
  - Laptops and desktops
- Adaptive layouts and font scaling
- Optimized for portrait and landscape orientations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for backend)
- Expo CLI (for mobile app)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/wellvantage

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server Port
PORT=5000
```

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
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

3. Configure API endpoint in `src/config/api.js`:
```javascript
// Update the baseURL to match your backend server
const API_BASE_URL = 'http://localhost:5000/api';
```

4. Start the Expo development server:
```bash
npm start
```

5. Run on your device:
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator

### Mobile
- **Framework**: React Native
- **Platform**: Expo
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: 
  - React Native Calendars
  - React Native Community DateTimePicker
- **Responsive Design**: Custom responsive utilities

## Project Architecture

### Mobile App Structure

- **Components**: Reusable UI components (Sidebar)
- **Screens**: Main application screens
- **Context**: Global state management (AuthContext)
- **Services**: API communication layer (mockApi for development)
- **Utils**: Helper functions (responsive design utilities)
- **Config**: Application configuration (API endpoints)

### Backend Structure

- **Routes**: API endpoint definitions
- **Models**: Database schemas (Mongoose models)
- **Middleware**: Request processing (authentication)

## API Endpoints

See `backend/README.md` for detailed API documentation.

### Main Endpoints:
- `GET /api/workouts` - Get all workout plans
- `POST /api/workouts` - Create a workout plan
- `DELETE /api/workouts/:id` - Delete a workout plan
- `GET /api/availability` - Get availability slots
- `POST /api/availability` - Create availability slot
- `POST /api/availability/:id/book` - Book a slot
- `DELETE /api/availability/:id` - Delete a slot

## Development Notes

### Mock API
The mobile app uses a mock API service (`src/services/mockApi.js`) for development and testing. This allows development without requiring a running backend server.

### Responsive Design
The app includes comprehensive responsive design utilities (`src/utils/responsive.js`) that automatically adapt to different screen sizes and device types.

### Guest Mode
The app currently operates in guest mode, allowing users to continue without authentication. This simplifies the development and testing process.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

