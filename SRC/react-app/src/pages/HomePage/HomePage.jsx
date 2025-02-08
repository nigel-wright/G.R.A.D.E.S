/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import "./HomePage.css";

const StudentDashboard = ({
  user,
  handleCourseSearch,
  handleViewCourse,
  handleRegisterUnregister,
  handleViewCalendar,
  handleViewTranscript,
  handleAddCalendarEvent,
}) => (
  <div className="home-container">
    <div className="welcome-header">
      <h1 className="welcome-message">Welcome Back!</h1>
      <h2 className="user-email">{user?.fullName}</h2>
      <p className="status-message">{user?.role} Portal</p>
    </div>

    <div className="home-content">
      <div className="action-section">
        <h3 className="section-title">Course Management</h3>
        <button className="action-button" onClick={handleCourseSearch}>
          Search Courses
        </button>
        <button className="action-button" onClick={handleViewCourse}>
          View My Courses
        </button>
        <button className="action-button" onClick={handleRegisterUnregister}>
          Course Registration
        </button>
        <button className="action-button" onClick={handleViewTranscript}>
          Academic Transcript
        </button>
      </div>

      <div className="action-section">
        <h3 className="section-title">Calendar</h3>
        <button className="action-button" onClick={handleViewCalendar}>
          View Calendar
        </button>
        <button className="action-button" onClick={handleAddCalendarEvent}>
          Add Calendar Event
        </button>
      </div>
    </div>
  </div>
);

const FacultyDashboard = ({
  user,
  handleViewCourseInstructor,
  handleModifyCourse,
}) => (
  <div className="home-container">
    <div className="welcome-header">
      <h1 className="welcome-message">Welcome Back!</h1>
      <h2 className="user-email">{user?.fullName}</h2>
      <p className="status-message">{user?.role} Portal</p>
    </div>

    <div className="home-content">
      <div className="action-section">
        <h3 className="section-title">Faculty Dashboard</h3>

        <button
          className="action-button"
          onClick={() => handleViewCourseInstructor()}
        >
          View My Courses
        </button>
        <button className="action-button" onClick={handleModifyCourse}>
          Modify Courses
        </button>
      </div>
    </div>
  </div>
);

const AdminDashboard = ({ user, handleManageStudents,handleManageFaculty }) => (
  <div className="home-container">
    <div className="welcome-header">
      <h1 className="welcome-message">Welcome Back!</h1>
      <h2 className="user-email">{user?.fullName}</h2>
      <p className="status-message">{user?.role} Portal</p>
    </div>

    <div className="home-content">
      <div className="action-section">
        <h3 className="section-title">Admin Dashboard</h3>

        <button
          className="action-button"
          onClick={() => handleManageStudents()}
        >
          Manage Students
        </button>
        <button
          className="action-button"
          onClick={() => handleManageFaculty()}
        >
          Manage Faculty
        </button>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const { user, isAdmin } = useContext(UserContext);
  const navigate = useNavigate();

  const handleCourseSearch = () => {
    navigate("/course-search");
  };

  const handleViewCourse = () => {
    navigate("/course-view");
  };
  const handleViewCourseInstructor = () => {
    navigate("/course-view-instructor");
  };

  const handleRegisterUnregister = () => {
    navigate("/registration");
    navigate("/course-registration");
  };

  const handleViewCalendar = () => {
    navigate("/view-calendar");
  };

  const handleAddCalendarEvent = () => {
    navigate("/add-event");
  };

  const handleViewTranscript = () => {
    navigate("/transcript");
  };

  const handleModifyCourse = () => {
    navigate("/modify-course");
  };

  const handleManageStudents = () => {
    navigate("/manage-students");
  };
  const handleManageFaculty= () => {
    navigate("/manage-faculty");
  };

  return (
    <div className="home-container">
      {user?.role === "Student" ? (
        <StudentDashboard
          user={user}
          handleCourseSearch={handleCourseSearch}
          handleViewCourse={handleViewCourse}
          handleRegisterUnregister={handleRegisterUnregister}
          handleViewCalendar={handleViewCalendar}
          handleViewTranscript={handleViewTranscript}
          handleAddCalendarEvent={handleAddCalendarEvent}
        />
      ) : isAdmin ? (
        <AdminDashboard
          user={user}
          handleManageStudents={handleManageStudents}
          handleManageFaculty={handleManageFaculty}
        />
      ) : (
        <FacultyDashboard
          user={user}
          handleViewCourseInstructor={handleViewCourseInstructor}
          handleModifyCourse={handleModifyCourse}
        />
      )}
    </div>
  );
};

export default HomePage;
