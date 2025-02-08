import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext"; 
import "./CourseRegistrationPage.css";

const CourseRegistrationPage = () => {
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://127.0.0.1:5000/api/courses");
        setCourses(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setIsLoading(false);
      }
    };

    const fetchRegisteredCourses = async () => {
      if (!user || !user.studentID) return;

      
      const savedCourses = JSON.parse(localStorage.getItem(`registeredCourses-${user.studentID}`));
      if (savedCourses) {
        setRegisteredCourses(savedCourses);
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/student/${user.studentID}/registered-courses`
        );
        const courseCodes = response.data.map((course) => course.courseCode);
        setRegisteredCourses(courseCodes);

        
        localStorage.setItem(`registeredCourses-${user.studentID}`, JSON.stringify(courseCodes));
      } catch (error) {
        console.error("Error fetching registered courses:", error);
      }
    };

    fetchCourses();
    fetchRegisteredCourses();
  }, [user]);

  const handleRegister = async (courseCode) => {
    if (!user || !user.studentID) {
      alert("User not logged in. Please log in to register for courses.");
      return;
    }

    try {
      const payload = { studentID: user.studentID, courseCode, cyear: 2025 };

      const response = await axios.post(
        `http://127.0.0.1:5000/api/student/register-course`,
        payload
      );

      alert(response.data.message || "Course registered successfully!");
      const updatedCourses = [...registeredCourses, courseCode];
      setRegisteredCourses(updatedCourses);

      
      localStorage.setItem(`registeredCourses-${user.studentID}`, JSON.stringify(updatedCourses));
    } catch (error) {
      console.error("Error registering course:", error);
      alert(error.response?.data?.error || "Failed to register course.");
    }
  };

  const handleUnregister = async (courseCode) => {
    if (!user || !user.studentID) {
      alert("User not logged in. Please log in to unregister courses.");
      return;
    }

    try {
      const payload = { studentID: user.studentID, courseCode };

      const response = await axios.post(
        `http://127.0.0.1:5000/api/student/unregister-course`,
        payload
      );

      alert(response.data.message || "Course unregistered successfully!");
      const updatedCourses = registeredCourses.filter((id) => id !== courseCode);
      setRegisteredCourses(updatedCourses);

      
      localStorage.setItem(`registeredCourses-${user.studentID}`, JSON.stringify(updatedCourses));
    } catch (error) {
      console.error("Error unregistering course:", error);
      alert(error.response?.data?.error || "Failed to unregister course.");
    }
  };

  const filteredCourses = searchQuery.trim()
    ? courses.filter((course) =>
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <div className="course-registration-container">
      <h1 className="page-title">Course Registration</h1>
      <div className="columns">
        <div className="column">
          <h2>Available Courses</h2>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          {isLoading ? (
            <p>Loading courses...</p>
          ) : (
            <ul className="course-list">
              {currentCourses.length > 0 ? (
                currentCourses.map((course) => (
                  <li key={course.courseCode} className="course-item">
                    <div className="course-details">
                      {Object.entries(course).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key}:</strong> {value}
                        </p>
                      ))}
                    </div>
                    <button
                      className="register-button"
                      onClick={() => handleRegister(course.courseCode)}
                      disabled={registeredCourses.includes(course.courseCode)}
                    >
                      Register
                    </button>
                  </li>
                ))
              ) : (
                <p className="no-results">No courses found.</p>
              )}
            </ul>
          )}
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        <div className="column">
          <h2>Registered Courses</h2>
          {registeredCourses.length > 0 ? (
            <ul className="registered-course-list">
              {registeredCourses.map((courseCode) => (
                <li key={courseCode} className="registered-course-item">
                  <div className="course-details">{courseCode}</div>
                  <button
                    className="unregister-button"
                    onClick={() => handleUnregister(courseCode)}
                  >
                    Unregister
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No registered courses.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseRegistrationPage;
