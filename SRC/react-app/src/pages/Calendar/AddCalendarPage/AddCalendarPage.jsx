import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';
import './AddCalendarPage.css';

const AddCalendarPage = () => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventStart, setEventStart] = useState('');
    const [eventDuration, setEventDuration] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const handleAddEvent = async () => {
        try {
            const newEvent = {
                eventName,
                eventDescription,
                eventStart,
                eventDuration,
                studentId: user.studentID,
                cyear: null,
                courseCode: null,
            };
           
            const response = await fetch('http://127.0.0.1:5000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent),
            });

            if (!response.ok) {
                throw new Error('Failed to add the event');
            }

           alert("Event successfully added");

            navigate('/view-calendar');
        } catch (error) {
            console.error('Error adding event:', error);
            setError('Failed to add the event. Please try again.');
        }
    };

    return (
        <div className="add-event-container">
            <h2>Add New Event</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label>Event Name</label>
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Start Date and Time</label>
                    <input
                        type="datetime-local"
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Duration (HH:mm:ss)</label>
                    <input
                        type="text"
                        value={eventDuration}
                        onChange={(e) => setEventDuration(e.target.value)}
                        required
                    />
                </div>
                <button type="button" onClick={handleAddEvent}>Add Event</button>
            </form>

            {error && <div className="error-message">{error}</div>}

            <div className="back-button">
                <button onClick={() => navigate('/view-calendar')}>Back to Calendar</button>
            </div>
        </div>
    );
};

export default AddCalendarPage;
