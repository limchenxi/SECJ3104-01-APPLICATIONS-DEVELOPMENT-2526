import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { resolveRedirectPath } from "../utils/navigation";
import useAuth from "../hooks/useAuth";
import Logout from "../components/Logout";
import EditProfile from "../features/Profile/pages/EditProfile";
import RoleGuard from "../components/RoleGuard";

const Login = lazy(() => import("../features/Auth/pages/LoginForm"));

const ProfilePage = lazy(() =>
  import("../features/Profile/pages/ProfileV2")
);

// Dashboard - all roles
const GuruDashboard = lazy(
  () => import("../features/Dashboard/pages/GuruDashboard")
);
const PentadbirDashboard = lazy(
  () => import("../features/Dashboard/pages/PentadbirDashboard")
);
const SuperAdminDashboard = lazy(
  () => import("../features/Dashboard/pages/SuperAdminDashboard")
);

const  TeachingAssignmentPage = lazy(
  () => import("../features/TeachingAssignment/pages/Assignment")
);

// Guru Pages
const KedatanganPage = lazy(() =>
  // import("../features/Kedatangan/pages/Kedatangan").then((module) => ({
//   default: module.KedatanganPage,
// }))
import("../features/Kedatangan/pages/Kedatangan")
);
const RPH = lazy(() => import("../features/RPH/pages/index"));
const RPHGenerator = lazy(
  () => import("../features/RPH/pages/New")
);
const QuizGenerator = lazy(
  () => import("../features/Quiz/pages/QuizGenerator")
);

// Pentadbir Pages
const PentadbirCerapan = lazy(
  () => import("../features/Pentadbir/pages/Cerapan")
);
const PentadbirTemplateRubrik = lazy(
  () => import("../features/Pentadbir/pages/TemplateRubrik")
);
const PentadbirTemplateRubrikDetail = lazy(
  () => import("../features/Pentadbir/pages/TemplateRubrikDetail")
);

//Superadmin Pages
const UserList= lazy(
  () => import("../features/Users/pages/User")
);
const AIManagementIndex= lazy(
  () => import("../features/AI/pages/index")
);
const AIList= lazy(
  () => import("../features/AI/pages/model/ai-list")
);
const AiUsageAnalytics= lazy(
  () => import("../features/AI/pages/usage/ai-usage")
);
const SchoolConfiguration= lazy(
  () => import("../features/School/pages/SchoolConfiguration")
);
const BasicInfo= lazy(
  () => import("../features/School/pages/BasicInfo")
)
const ObservationSetting= lazy(
  () => import("../features/School/pages/ObservationSetting")
)
const AttendanceSetting= lazy(
  () => import("../features/School/pages/AttendanceSetting")
)
const Notification= lazy(
  () => import("../features/School/pages/Notification")
)

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
const TeacherReportHistory = lazy(
  () => import("../features/Cerapan/pages/TeacherReportHistory")
);

const NotFound = lazy(() => import("./NotFound"));
const ProtectedLayout = lazy(() => import("./ProtectedLayout"));
  
const LoginRoute = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = resolveRedirectPath(searchParams.get("redirect"), "/");
  const { user, isAuthenticated, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) {
    return <SuspenseFallback />;
  }

  if (isAuthenticated) {
    // const role = user?.role;

    // const defaultPath =
    //   role === "GURU"
    //     ? "/dashboard/guru"
    //     : role === "PENTADBIR"
    //     ? "/dashboard/pentadbir"
    //     : "/superadmin/dashboard";
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
          {/* <Route index element={<Dashboard />} /> */}

          <Route 
            path="/teaching-assignment" 
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <TeachingAssignmentPage />
              </RoleGuard>
            } 
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfile />} />
              <Route
                path="/pentadbir/cerapan/report/:id"
                element={
                  <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                    <CerapanResults />
                  </RoleGuard>
                }
              />

          {/* GURU ROUTES */}
          <Route
            path="/dashboard/guru"
            element={
              <RoleGuard roles={["GURU"]}>
                <GuruDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/kedatangan"
            element={
              <RoleGuard roles={["GURU"]}>
                <KedatanganPage />
              </RoleGuard>
            }
          />
          <Route
            path="/rph"
            element={
              <RoleGuard roles={["SUPERADMIN", "GURU"]}>
                <RPH />
              </RoleGuard>
            }
          />
          <Route
            path="/rph/new"
            element={
              <RoleGuard roles={["SUPERADMIN", "GURU"]}>
                <RPHGenerator />
              </RoleGuard>
            }
          />
          <Route
            path="/quiz"
            element={
              <RoleGuard roles={["SUPERADMIN", "GURU"]}>
                <QuizGenerator />
              </RoleGuard>
            }
          />
          {/* Cerapan Routes */}
          <Route
            path="/cerapan"
            element={
              <RoleGuard roles={["SUPERADMIN", "GURU"]}>
                <TeacherCerapanKendiri />
              </RoleGuard>
            }
          />
          <Route 
            path="/cerapan/task/:id" 
            element={
              <RoleGuard roles={["SUPERADMIN", "GURU"]}>
                <SelfEvaluationForm />
              </RoleGuard>
            } 
          />
          <Route path="/cerapan/results/:id" element={<CerapanResults />} />
          <Route 
            path="/cerapan/admin" 
            element={
              <RoleGuard roles={["SUPERADMIN", "GURU"]}>
                <AdminCerapanDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/cerapan/admin/observation/:id" 
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <AdminObservationForm />
              </RoleGuard>
            } 
          />
          <Route 
            path="/cerapan/old" 
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <PentadbirCerapanForm />
              </RoleGuard>
            } 
          />
          <Route path="/cerapan/my-reports" element={<TeacherReportHistory />} />
          
          {/* Pentadbir Routes */}
          <Route
            path="/dashboard/pentadbir"
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <PentadbirDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/pentadbir/cerapan"
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <PentadbirCerapan />
              </RoleGuard>
            }
          />
          <Route
            path="/cerapan/report/:id"
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <CerapanResults />
              </RoleGuard>
            }
          />
          {/* Removed tugasan cerapan page */}
          <Route
            path="/pentadbir/observation/:id"
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <AdminObservationForm />
              </RoleGuard>
            }
          />
          <Route
            path="/pentadbir/template-rubrik"
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <PentadbirTemplateRubrik />
              </RoleGuard>
            }
          />
          <Route
            path="/pentadbir/template-rubrik/:templateId"
            element={
              <RoleGuard roles={["SUPERADMIN", "PENTADBIR"]}>
                <PentadbirTemplateRubrikDetail />
              </RoleGuard>
            }
          />
          {/* Super Admin */}
          <Route
            path="/dashboard/superadmin"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <SuperAdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/ai"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <AIManagementIndex/>
              </RoleGuard>
            }
          />
          <Route
            path="/ai/list"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <AIList/>
              </RoleGuard>
            }
          />
          <Route
            path="/ai/usage"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <AiUsageAnalytics/>
              </RoleGuard>
            }
          />
          <Route
            path="/school-setting"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <SchoolConfiguration/>
              </RoleGuard>
            }
          />
          <Route
            path="/school-setting/info"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <BasicInfo initialData={{
                  name: "",
                  address: "",
                  timezone: "",
                  language: "",
                  currentAcademicYear: ""
                }}/>
              </RoleGuard>
            }
          />
          <Route
            path="/school-setting/observation"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <ObservationSetting initialData={undefined}/>
              </RoleGuard>
            }
          />
          <Route
            path="/school-setting/attendance"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <AttendanceSetting initialData={undefined}/>
              </RoleGuard>
            }
          />
          <Route
            path="/school-setting/notification"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <Notification initialData={undefined}/>
              </RoleGuard>
            }
          />

          <Route
            path="/users"
            element={
              <RoleGuard roles={["SUPERADMIN"]}>
                <UserList />
              </RoleGuard>
            }
          />
          
          <Route path="/logout" element={<Logout />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
