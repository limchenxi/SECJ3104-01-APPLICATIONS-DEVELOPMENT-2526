import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { resolveRedirectPath } from "../utils/navigation";
import useAuth from "../hooks/useAuth";

const Login = lazy(() => import("../features/Auth/pages/LoginForm"));
const PentadbirCerapanForm = lazy(
  () => import("../features/Cerapan/pages/Cerapan")
);
const Dashboard = lazy(
  () => import("../features/Dashboard/pages/Dashboard")
);
const KedatanganPage = lazy(() =>
  import("../features/Kedatangan/pages/Kedatangan").then((module) => ({
    default: module.KedatanganPage,
  }))
);
const ProfilePage = lazy(() =>
  import("../features/Profil/pages/Profile").then((module) => ({
    default: module.Profil,
  }))
);
const QuizFlashcardPage = lazy(
  () => import("../features/Quiz/pages/QuizGenerator")
);
const RPHGeneratorPage = lazy(
  () => import("../features/RPH/pages/RPH_Generator")
);
const NotFound = lazy(() => import("./NotFound"));
const ProtectedLayout = lazy(() => import("./ProtectedLayout"));

const LoginRoute = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = resolveRedirectPath(searchParams.get("redirect"), "/");
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) {
    return <SuspenseFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Login />;
};

const SuspenseFallback = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kedatangan" element={<KedatanganPage />} />
          <Route path="cerapan" element={<PentadbirCerapanForm />} />
          <Route path="rph" element={<RPHGeneratorPage />} />
          <Route path="quiz" element={<QuizFlashcardPage />} />
          <Route path="profil" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
