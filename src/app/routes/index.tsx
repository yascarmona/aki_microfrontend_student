import { Routes, Route, Navigate } from 'react-router-dom';
import ConfirmAttendancePage from '@/features/attendance/pages/ConfirmAttendancePage';
import QrDisplayPage from '@/features/qr/pages/QrDisplayPage';
import Index from '@/pages/Index';

export function AppRoutes() {
  return (
    <Routes>
  <Route path="/qr" element={<QrDisplayPage />} />
  <Route path="/attendance/confirm" element={<ConfirmAttendancePage />} />
    <Route path="/" element={<Index />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
