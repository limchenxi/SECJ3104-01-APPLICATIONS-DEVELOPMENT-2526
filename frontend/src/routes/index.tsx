import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { resolveRedirectPath } from "../utils/navigation";
import useAuth from "../hooks/useAuth";
import Logout from "../components/Logout";
import EditProfile from "../features/Profile/pages/EditProfile";
import RoleGuard from "../components/RoleGuard";

const Login = lazy(() => import("../features/Auth/pages/LoginForm"));

// Cerapan Pages
const TeacherCerapanKendiri = lazy(
  () => import("../features/Cerapan/pages/TeacherCerapanKendiri")
);
const SelfEvaluationForm = lazy(
  () => import("../features/Cerapan/pages/SelfEvaluationForm")
);
const CerapanResults = lazy(
  () => import("../features/Cerapan/pages/CerapanResults")
);
const AdminCerapanDashboard = lazy(
  () => import("../features/Cerapan/pages/AdminCerapanDashboard")
);
const AdminObservationForm = lazy(
  () => import("../features/Cerapan/pages/AdminObservationForm")
);
const PentadbirCerapanForm = lazy(
  () => import("../features/Cerapan/pages/sample/Cerapan")
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
  import("../features/Profile/pages/Profile")
);
const QuizFlashcardPage = lazy(
  () => import("../features/Quiz/pages/QuizGenerator")
);
const RPHGeneratorPage = lazy(
  () => import("../features/RPH/pages/RPH_Generator")
);
const  TeachingAssignmentPage = lazy(
  () => import("../features/TeachingAssignment/pages/Assignment")
);
const UserList= lazy(
  () => import("../features/Users/pages/User")
);

// Pentadbir Pages
const PentadbirLayout = lazy(
  () => import("../features/Pentadbir/components/PentadbirLayout")
);
const PentadbirDashboard = lazy(
  () => import("../features/Pentadbir/pages/PentadbirDashboard")
);
const PentadbirKedatangan = lazy(
  () => import("../features/Pentadbir/pages/Kedatangan")
);
const PentadbirCerapan = lazy(
  () => import("../features/Pentadbir/pages/Cerapan")
);
const PentadbirTemplateRubrik = lazy(
  () => import("../features/Pentadbir/pages/TemplateRubrik")
);
const PentadbirTemplateRubrikDetail = lazy(
  () => import("../features/Pentadbir/pages/TemplateRubrikDetail")
);
const PentadbirProfil = lazy(
  () => import("../features/Pentadbir/pages/Profil")
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
          {/* DASHBOARD - all roles */}
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Kedatangan - DEV + GURU */}
          <Route
            path="/kedatangan"
            element={
              <RoleGuard roles={["DEVELOPER", "GURU"]}>
                <KedatanganPage />
              </RoleGuard>
            }
          />
          
          {/* Cerapan Routes */}
          {/* Cerapan - GURU + DEV */}
          <Route
            path="/cerapan"
            element={
              <RoleGuard roles={["DEVELOPER", "GURU"]}>
                <TeacherCerapanKendiri />
              </RoleGuard>
            }
          />
          <Route 
            path="/cerapan/task/:id" 
            element={
              <RoleGuard roles={["DEVELOPER", "GURU"]}>
                <SelfEvaluationForm />
              </RoleGuard>
            } 
          />
          <Route path="/cerapan/results/:id" element={<CerapanResults />} />
          <Route 
            path="/cerapan/admin" 
            element={
              <RoleGuard roles={["DEVELOPER", "PENTADBIR"]}>
                <AdminCerapanDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/cerapan/admin/observation/:id" 
            element={
              <RoleGuard roles={["DEVELOPER", "PENTADBIR"]}>
                <AdminObservationForm />
              </RoleGuard>
            } 
          />
          <Route 
            path="/cerapan/old" 
            element={
              <RoleGuard roles={["DEVELOPER", "PENTADBIR"]}>
                <PentadbirCerapanForm />
              </RoleGuard>
            } 
          />
          
          {/* RPH - DEV + GURU */}
          <Route
            path="/rph"
            element={
              <RoleGuard roles={["DEVELOPER", "GURU"]}>
                <RPHGeneratorPage />
              </RoleGuard>
            }
          />
          {/* Quiz - DEV + GURU */}
          <Route
            path="/quiz"
            element={
              <RoleGuard roles={["DEVELOPER", "GURU"]}>
                <QuizFlashcardPage />
              </RoleGuard>
            }
          />
          <Route path="/teaching-assignment" element={<TeachingAssignmentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          
          {/* UserList - DEV only */}
          <Route
            path="/users"
            element={
              <RoleGuard roles={["DEVELOPER"]}>
                <UserList />
              </RoleGuard>
            }
          />
          {/* AIManagement - DEV only */}
          {/* <Route
            path="/ai"
            element={
              <RoleGuard roles={["DEVELOPER"]}>
                <AIManagement/>
              </RoleGuard>
            }
          /> */}

          {/* Pentadbir Routes */}
          <Route path="/pentadbir" element={<PentadbirLayout />}>
            <Route index element={<PentadbirDashboard />} />
            <Route path="kedatangan" element={<PentadbirKedatangan />} />
            <Route path="cerapan" element={<PentadbirCerapan />} />
            {/* Removed tugasan cerapan page */}
            <Route path="observation/:id" element={<AdminObservationForm />} />
            <Route path="template-rubrik" element={<PentadbirTemplateRubrik />} />
            <Route path="template-rubrik/:templateId" element={<PentadbirTemplateRubrikDetail />} />
            <Route path="profil" element={<PentadbirProfil />} />
          </Route>
          
          <Route path="/logout" element={<Logout />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
