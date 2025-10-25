import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterDevice from '@/features/device/pages/RegisterDevice';
import ScanPage from '@/features/scan/pages/ScanPage';
import { DeviceStorage } from '@/services/storage/device-storage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isRegistered = DeviceStorage.isRegistered();
  return isRegistered ? <>{children}</> : <Navigate to="/register-device" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/register-device" element={<RegisterDevice />} />
      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <ScanPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/scan" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
