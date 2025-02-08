import { UserProvider } from "./context/UserContext";
import HomePage from "./pages/HomePage/HomePage";
import StudentLoginPage from "./pages/StudentLoginPage/StudentLoginPage";
import ViewCalendarPage from "./pages/Calendar/ViewCalendarPage/ViewCalendarPage";
import AddCalendarPage from "./pages/Calendar/AddCalendarPage/AddCalendarPage";
import LaunchPage from "./pages/LaunchPage/LaunchPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header/Header";
import FacultyLoginPage from "./pages/FacultyLoginPage.jsx/FacultyLoginPage";
import SearchCourse from "./pages/SearchCourse/SearchCourse";
import TranscriptPage from "./pages/Transcript/TranscriptPage";
import CourseView from "./pages/CourseView/CourseView";
import CourseViewInstructor from "./pages/CourseViewInstructor/CourseViewInstructor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ManageStudentsPage from "./pages/ManageStudents/ManageStudentsPage";
import CourseRegistrationPage from './pages/CourseRegistration/CourseRegistrationPage';
import ModifyCourse from './pages/ModifyCourse/ModifyCourse';
import ManageFacultyPage from './pages/ManageFaculty/ManageFaculty';
const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LaunchPage />} />
          <Route path="/student-login" element={<StudentLoginPage />} />
          <Route path="/faculty-login" element={<FacultyLoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <HomePage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-calendar"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <ViewCalendarPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-search"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <SearchCourse />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-view"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <CourseView />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-event"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <AddCalendarPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-students"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <ManageStudentsPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transcript"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <TranscriptPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-registration"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <CourseRegistrationPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-view-instructor"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <CourseViewInstructor />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/modify-course"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <ModifyCourse />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-faculty"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <ManageFacultyPage />
                </>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
