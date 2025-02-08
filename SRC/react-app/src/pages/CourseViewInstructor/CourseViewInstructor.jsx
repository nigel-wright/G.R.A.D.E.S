import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import "./CourseViewInstructor.css";

const CourseViewInstructor = () => {
    const [courses, setCourses] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                if (!user?.facultyID) {
                    throw new Error("No authenticated faculty member found");
                }

                const response = await fetch(
                    `http://127.0.0.1:5000/api/faculty/${user.facultyID}/courses`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }

                const data = await response.json();
                console.log("Courses data:", data);

                if (!data.courses || typeof data.courses !== 'object') {
                    throw new Error("Courses data is in an unexpected format");
                }

                setCourses(data.courses);
            } catch (err) {
                console.error("Courses fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchCourses();
        }
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!courses) return <div>No course data available</div>;

    return (
        <div className="course-view-container">
            <div className="back-button">
                <Link to="/home">
                    <button>Back to Home</button>
                </Link>
            </div>

            <h2>My Courses</h2>

            <div className="instructor-info">
                <h3>My Information</h3>
                <p><strong>Faculty ID:</strong> {user.facultyID}</p>
                <p><strong>Name:</strong> {user.fullName}</p>
            </div>

            <div className="course-records">
                {Object.entries(courses)
                    .sort(([yearA], [yearB]) => yearA - yearB) // Sort by academic year
                    .map(([year, courses]) => (
                        <div key={year} className="academic-year">
                            <h3>Academic Year {year}</h3>
                            <div className="course-cards">
                                {courses.map((course) => (
                                    <div key={`${course.courseCode}-${year}`} className="course-card">
                                        <h4>{course.courseName}</h4>
                                        <p><strong>Course Code:</strong> {course.courseCode}</p>
                                        <p><strong>Credits:</strong> {course.credits}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default CourseViewInstructor;
