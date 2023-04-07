import { NavLink } from "react-router-dom";
import { useContext } from 'react';

import {AuthContext} from '../../contexts/AuthContext';

function Navigation() {
    const { isAuthenticated, userEmail } = useContext(AuthContext);

    return (
        <nav style={{marginLeft:"30px"}}>
            {isAuthenticated && (
                    <div id="user">
                        <span>{userEmail}</span>
                        <NavLink style={{marginLeft:"20px"}} to="/">Home</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/activities">Activities</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/create">Create Activity</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/logout">Logout</NavLink>
                    </div>
                )}
                {!isAuthenticated && (
                    <div id="guest">
                        <NavLink style={{marginLeft:"20px"}} to="/">Home</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/activities">Activities</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/login">Login</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/register">Register</NavLink>
                    </div>
                )}
        </nav>
    );
}

export default Navigation;