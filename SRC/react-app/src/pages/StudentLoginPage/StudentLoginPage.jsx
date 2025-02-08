import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import AuthService from '../../services/AuthService';
import './StudentLoginPage.css';

const StudentLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await AuthService.login(email, password);
            if (response.success) {
                login({
                    ...response.user,
                    role: 'Student'
                });
                navigate('/home');
            } else {
                setError(response.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <h2>Student Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default StudentLoginPage;
