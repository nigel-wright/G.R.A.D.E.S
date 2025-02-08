import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import './Header.css';
import AuthService from '../../services/AuthService';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(UserContext);

    const handleLogout = () => {
        AuthService.logout();
        logout();
        navigate('/');
    };

    const handleHomeClick = () => {
        navigate('/home');
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1>G.R.A.D.E.S</h1>
                {user?.role && <span className="user-role">{user.role}</span>}
            </div>
            <div className="header-right">
                <button onClick={handleHomeClick} className="home-button">
                    Home
                </button>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
