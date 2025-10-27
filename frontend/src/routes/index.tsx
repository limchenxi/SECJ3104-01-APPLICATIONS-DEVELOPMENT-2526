import { Routes, Route } from "react-router-dom";
import Dashboard from "../features/Dashboard/pages/Dashboard";
import Kedatangan from "../features/Kedatangan/pages/Kedatangan";
import Cerapan from "../features/Cerapan/pages/Cerapan";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/kedatangan" element={<ProtectedRoute><Kedatangan /></ProtectedRoute>} />
      <Route path="/cerapan" element={<ProtectedRoute><Cerapan /></ProtectedRoute>} />
      <Route path="/rph" element={<ProtectedRoute><RPHGenerator /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><AIQuizGenerator /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
