import React from 'react';
import { Link } from 'react-router-dom';
import './LaunchPage.css'; // Optional for styling

const LaunchPage = () => {
    return (
        <div className="launch-container">
            <h1>Welcome to GRADES</h1>
            <div className="launch-buttons">
                <Link to="/student-login">
                    <button className="launch-button student">Login as Student</button>
                </Link>
                <Link to="/faculty-login">
                    <button className="launch-button faculty">Login as Faculty Member</button>
                </Link>
            </div>
        </div>
    );
};

export default LaunchPage;
