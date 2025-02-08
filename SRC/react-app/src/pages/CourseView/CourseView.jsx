import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../../components/SearchBar/SearchBar'
import axios from 'axios'; 
import './CourseView.css';

function CourseView() {
    const [error, setError] = useState(""); 
    const [results, setResults] = useState([]); 
    const [hasSearched, setHasSearched] = useState(false); 
    const [expandedCourse, setExpandedCourse] = useState(null); 
    const [profInfo, setProfInfo] = useState([]); 
    
    const [no, resNo] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearch = async (query) => {
        const { noOfResults, search } = query;

        if (!search) {
            setError("Please input a course name or code.")
            return;
        }
        
        resNo(noOfResults);
        setHasSearched(true) 
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/student/view-course', {
                params: { studentID:search }
            });

            if (response.status === 200) {
                setResults(response.data);
                setCurrentPage(1);
            } else {
                setError("There was an issue finding you course.")
            }
        } catch (err) {
            console.log("There was an error: ", err); 
            setError(err.response.data.error)
        }
    }

    const toggleMore = async (code, year) => {
        setExpandedCourse(expandedCourse === code ? null : code);
        try {
            const response = await axios.get('/api/student/prof-info', {
                params: { courseCode: code, cyear: year.toString() }
            });

            if (response.status == 200) {
                setProfInfo(response.data)
                setError("")
            } else {
                setError(response.data)
            }
        } catch (err) {
            console.log("Error when getting prof info: ", err)
            setError(err.response.data.error)
        }
    }

    const indexOfLastResult = currentPage * no;
    const indexOfFirstResult = indexOfLastResult - no;
    const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    const nextPage = () => {
        if (currentPage < Math.ceil(results.length / no)) {
            setCurrentPage(currentPage + 1);
        }
    }

  return (
    <>
        <div className="back-button">
            <Link to="/home">
                <button>Back to Home</button>
            </Link>
        </div>

        <div className='search-bar'>
            <SearchBar onSearch={handleSearch}/>
        </div>

        <div className='results-container'>
            {hasSearched ? (
                results.length > 0 ? (
                <>
                <h1 className='list-title'>YOUR COURSES ARE:</h1>
                <ul>
                    {currentResults.map((course, idx) => (
                        <li key={idx}>
                            <h3>{course.courseName}</h3>
                            <p><strong>Course Code: </strong>{course.courseCode}</p>
                            <p><strong>Description: </strong>{course.courseDescription}</p>
                            <p><strong>Grade: </strong>{course.grade}</p>
                            <p><strong>Credit: </strong>{course.credits}</p>
                            <p><strong>Year: </strong>{course.cyear}</p>
                            <button className='toggle-button' onClick={() => toggleMore(course.courseCode, course.cyear)}>
                                {expandedCourse === course.courseCode ? "VIEW LESS" : "VIEW MORE"}
                            </button>

                            {expandedCourse === course.courseCode && (
                                <div className='extra-info'>
                                    <ul>
                                        {profInfo.map((prof, idx) => (
                                            <li key={idx} className='prof-info'>
                                                <h4><b>Instructor Name: </b>{prof.instructorName}</h4>
                                                <p><strong>Department: </strong>{prof.departmentName}</p>
                                                <p><strong>Office: </strong>{prof.instructorOffice}</p>
                                                <p><strong>Contact Info: </strong>{prof.instructorContact}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Pagination controls */}
                <div className='pagination'>
                        <div
                            style={{
                                border: 'solid 2px #345',
                                padding: '5px 10px',
                                borderRadius: '2px',
                            }}
                        >
                            {1}
                        </div>
                        <button onClick={prevPage}>Previous</button>
                        <div
                            style={{
                                border: 'solid 2px #345',
                                padding: '5px 10px',
                                borderRadius: '5px',
                            }}
                        >
                            {currentPage}
                        </div>
                        <button onClick={nextPage}>Next</button>
                        <div
                            style={{
                                border: 'solid 2px #345',
                                padding: '5px 10px',
                                borderRadius: '2px',
                            }}
                        >
                            {Math.ceil(results.length / no)}
                        </div>
                    </div>

                </>
            ) : (
            <h3>{error}</h3>
        )
    ) : (
        <h3>Search using your studentID to see your courses.</h3>
        )}
        </div>
    </>
  )
}

export default CourseView