# React Dashboard - PoleGuardian

The futuristic web dashboard for the PoleGuardian Smart Water Intelligence System.

## Features

- **Real-time Monitoring**: Live sensor data visualization with 5-second updates
- **AI Analytics**: Theft detection, leak prevention, and usage pattern analysis
- **Glassmorphism UI**: Modern dark theme with blue/cyan neon accents
- **Responsive Design**: 4-column grid layout optimized for all devices
- **Framer Motion**: Smooth animations and interactive elements
- **Firebase Integration**: Real-time database synchronization

## Tech Stack

- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Framer Motion**: Production-ready motion library
- **Firebase SDK**: Real-time database and authentication
- **Recharts**: Responsive chart library for data visualization
- **Lucide React**: Beautiful icon library

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase**:
   - Update `src/services/firebase.js` with your Firebase config
   - Ensure Firebase project is set up with Singapore region database

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Dashboard/       # Main dashboard components
│   ├── Charts/          # Data visualization components
│   ├── Navigation/      # Navigation and status components
│   └── UI/              # Base UI components (Card, Button, etc.)
├── hooks/               # Custom React hooks
│   ├── useFirebase.js   # Firebase integration hook
│   ├── useRealTimeData.js # Real-time data management
│   └── useAnalytics.js  # AI analytics hook
├── services/            # External service integrations
│   ├── firebase.js      # Firebase configuration
│   ├── analytics.js     # AI analytics service
│   └── alerts.js        # Alert management service
├── utils/               # Utility functions
│   ├── dataProcessing.js # Data transformation utilities
│   └── animations.js    # Animation helpers
└── test/                # Test files and setup
```

## Key Components

### Dashboard Layout
- **4-column responsive grid** that adapts to screen sizes
- **Glassmorphism cards** with frosted glass effects and neon borders
- **Real-time status indicators** showing system health

### Analytics Cards
- **Flow Rate**: Real-time water flow in L/min
- **Pressure**: Current system pressure readings
- **Vibration Status**: Tamper detection indicator
- **Theft Risk**: AI-calculated theft probability percentage
- **Daily Consumption**: Today's total water usage
- **Alert Count**: Active system alerts

### Data Visualization
- **Flow Chart**: Real-time line graph of water flow
- **Pressure Graph**: Pressure fluctuation monitoring
- **Usage Analytics**: Weekly consumption patterns
- **Comparison Charts**: Daily usage comparisons

### AI Features
- **Theft Detection**: Off-hours usage analysis
- **Leak Detection**: Continuous flow monitoring
- **Pattern Analysis**: Machine learning-based anomaly detection
- **Predictive Analytics**: Usage forecasting and maintenance scheduling

## Styling Guidelines

### Theme Colors
- **Primary Background**: `#0b0e14` (Dark space theme)
- **Accent Blue**: `#00d4ff` (Neon blue for highlights)
- **Accent Cyan**: `#00ffff` (Cyan for secondary elements)
- **Accent Purple**: `#8b5cf6` (Purple for gradients)

### Glassmorphism Effects
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

### Animations
- **Smooth transitions** for all interactive elements
- **Pulse effects** for real-time data indicators
- **Slide animations** for alerts and notifications
- **Glow effects** on hover and focus states

## Performance Optimization

- **Code Splitting**: Lazy loading for route-based components
- **Memoization**: React.memo for expensive components
- **Debounced Updates**: Optimized real-time data handling
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Regular bundle size monitoring

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Custom Server
```bash
npm run build
# Serve the dist/ directory with your preferred server
```

## Environment Variables

Create a `.env.local` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=pole-guardian.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://pole-guardian-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=pole-guardian
```

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for new components when possible
3. Write tests for new features
4. Ensure responsive design across all screen sizes
5. Maintain accessibility standards (WCAG 2.1 AA)