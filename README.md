# AKI! Student Microfrontend

A mobile-first React + TypeScript application for student attendance registration via QR code scanning.

## 🎯 Features

- **Device Registration**: Link device to student CPF (one-time setup)
- **QR Code Scanning**: Register attendance by scanning QR codes
- **Offline Support**: Queue scans when offline, sync when connection restored
- **Geolocation**: Automatic GPS location capture for attendance verification
- **Real-time Feedback**: Success/error notifications with clear messaging
- **Mobile-First Design**: Optimized for smartphones with touch-friendly UI

## 🏗️ Architecture

Built following **Clean Architecture** + **SOLID** + **Vertical Slice Architecture** principles:

```
src/
├── app/                    # App-level configuration
│   ├── routes/            # Routing configuration
│   └── store/             # Global state management
├── features/              # Feature-based modules (vertical slices)
│   ├── device/           # Device registration
│   ├── scan/             # QR scanning & submission
│   └── presence/         # Presence confirmation
├── shared/               # Shared utilities & types
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Helper functions
└── services/            # External service integrations
    ├── http/           # API client (Axios)
    └── storage/        # LocalStorage & IndexedDB
```

## 🚀 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Zustand
- **UI Framework**: TailwindCSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **QR Scanning**: react-qr-reader
- **Notifications**: Sonner

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your BFF API URL
# VITE_API_BASE_URL=https://your-bff-api.com/v1
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t aki-student:latest .

# Run container
docker run -p 8080:80 aki-student:latest

# Access at http://localhost:8080
```

## 🌐 API Integration

The app communicates exclusively with the **BFF (Backend for Frontend)** layer:

### Device Registration
```http
POST /students/device
Content-Type: application/json

{
  "cpf": "12345678900",
  "device_id": "device_abc123"
}
```

### Scan Submission
```http
POST /scan
Content-Type: application/json

{
  "qr_token": "signed_jwt_token",
  "device_id": "device_abc123",
  "location": {
    "latitude": -23.550520,
    "longitude": -46.633308
  },
  "device_time": "2024-01-15T10:30:00.000Z"
}
```

## 📱 Offline Behavior

1. **Network Detection**: Automatically detects online/offline status
2. **Queue Management**: Failed scans are stored in localStorage
3. **Auto-Sync**: When connection is restored, queued scans are retried
4. **User Feedback**: Clear indicators show offline status and pending syncs
5. **Retry Logic**: Max 3 retry attempts per queued scan

## 🔒 Security

- Device ID stored securely in localStorage
- CPF validation before submission
- QR tokens are signed JWTs (validated by BFF)
- Location permissions requested only when needed
- No sensitive data logged to console in production

## 🎨 Design System

**Color Palette**:
- Primary: Golden Yellow (`#FFD700`)
- Secondary: Sienna Brown (`#A0522D`)
- Background: White (`#FFFFFF`)

**Key Principles**:
- Mobile-first responsive design
- Large touch targets (min 44px)
- High contrast for readability
- Smooth animations for feedback
- Minimal UI with clear CTAs

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_ENV` | Environment name | `production` |
| `VITE_API_BASE_URL` | BFF API base URL | `https://api.aki.com/v1` |
| `VITE_APP_NAME` | Application name | `AKI Student` |
| `VITE_DEVICE_STORAGE_KEY` | LocalStorage key | `aki_student_device` |

## 🧪 Testing (Future)

Code is structured for testability:
- Pure functions in utils
- Separated API layer
- Hooks for business logic
- Component isolation

## 📄 License

Proprietary - AKI! Project

## 👥 Authors

Built with ❤️ by the AKI! Team

---

For more information, contact the development team.
