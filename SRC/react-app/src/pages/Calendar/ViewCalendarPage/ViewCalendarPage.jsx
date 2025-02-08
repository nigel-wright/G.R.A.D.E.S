import { useState, useEffect, useContext } from 'react';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';
import './ViewCalendarPage.css';

const ViewCalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(moment());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);

    const fetchEvents = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/events/${user.studentID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            setEvents(data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);


    const handleDeleteEvent = async (eventId,courseId) => {
        if(courseId){
            alert("Cant Delete a weekly lecture");
            return
        }
        try {
            const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchEvents();
            } else {
                throw new Error('Failed to delete event');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const getDaysInMonth = () => {
        const startOfMonth = currentDate.clone().startOf('month').startOf('week');
        const endOfMonth = currentDate.clone().endOf('month').endOf('week');
        const days = [];
        let day = startOfMonth.clone();

        while (day.isSameOrBefore(endOfMonth, 'day')) {
            days.push(day.clone());
            day.add(1, 'day');
        }
        return days;
    };

    const getEventsForDay = (date) => {
        return events
            .filter(event => {
                const eventDate = moment(event.eventStart);
                return eventDate.isSame(date, 'day');
            })
            .sort((a, b) => {
                // Compare by event start time
                const timeA = moment(a.eventStart);
                const timeB = moment(b.eventStart);
                return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="calendar-container">
            <div className="back-button">
                <Link to="/home">
                    <button>Back to Home</button>
                </Link>
            </div>
            <div className="calendar-header">
                <button 
                    className="nav-button"
                    onClick={() => setCurrentDate(prev => prev.clone().subtract(1, 'month'))}
                >
                    Previous
                </button>
                <h2 className="calendar-title">
                    {currentDate.format('MMMM YYYY')}
                </h2>
                <button 
                    className="nav-button"
                    onClick={() => setCurrentDate(prev => prev.clone().add(1, 'month'))}
                >
                    Next
                </button>
            </div>

            <div className="calendar-grid">
                {weekDays.map(day => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}
                
                {days.map(day => (
                    <div 
                        key={day.format('YYYY-MM-DD')} 
                        className={`calendar-day ${day.isSame(moment(), 'day') ? 'today' : ''}`}
                    >
                        <span className="day-number">{day.format('D')}</span>
                        <div className="event-list">
                            {getEventsForDay(day).map(event => (
                                <div key={event.eventID} className="event">
                                    <div className="event-name">{event.eventName}</div>
                                    <div className="event-time">
                                    {moment(event.eventStart).add(5, 'hours').format('h:mm A')}

                                    </div>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteEvent(event.eventID,event.courseCode)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Link to="/add-event">
                <button className="add-event-button">Add Event</button>
            </Link>
        </div>
    );
};

export default ViewCalendarPage;
