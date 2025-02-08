import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from '../../context/UserContext';
import "./TranscriptPage.css";

const TranscriptPage = () => {
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                if (!user?.studentID) {
                    throw new Error("No authenticated user found");
                }

                const response = await fetch(
                    `http://127.0.0.1:5000/api/transcript/${user.studentID}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch transcript");
                }

                const data = await response.json();
                console.log("Transcript data:", data);

                // Group courses by year
                const groupedCourses = data.courses.reduce((acc, course) => {
                    if (!acc[course.cyear]) {
                        acc[course.cyear] = [];
                    }
                    acc[course.cyear].push(course);
                    return acc;
                }, {});

                setTranscript({
                    ...data,
                    groupedCourses
                });
            } catch (err) {
                console.error("Transcript fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTranscript();
        }
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!transcript) return <div>No transcript data available</div>;

    return (
        <div className="transcript-container">
            <div className="back-button">
                <Link to="/home">
                    <button>Back to Home</button>
                </Link>
            </div>

            <h2>Academic Transcript</h2>

            <div className="student-info">
                <h3>Student Information</h3>
                <p><strong>Student ID:</strong> {user.studentID}</p>
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Program:</strong> {user.program}</p>
                <p><strong>Overall GPA:</strong> {transcript.gpa.toFixed(2)}</p>
                <p><strong>Total Credits:</strong> {transcript.totalCredits}</p>
            </div>

            <div className="academic-records">
                {Object.entries(transcript.groupedCourses)
                    .sort(([yearA], [yearB]) => yearA - yearB)
                    .filter(([year]) => year >= 2024 && year <= 2026)
                    .map(([year, courses]) => (
                        <div key={year} className="academic-year">
                            <h3>Academic Year {year}</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Credits</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={`${course.courseCode}-${year}`}>
                                            <td>{course.courseCode}</td>
                                            <td>{course.courseName}</td>
                                            <td>{course.credits}</td>
                                            <td>{course.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default TranscriptPage;
