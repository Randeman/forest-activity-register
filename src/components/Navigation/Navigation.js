import { NavLink } from "react-router-dom";
import { useContext } from 'react';

import {AuthContext} from '../../contexts/AuthContext';

function Navigation() {
    const { isAuthenticated, email } = useContext(AuthContext);

    return (
        <nav style={{marginLeft:"30px"}}>
            {isAuthenticated && (
                    <div id="user">
                        <NavLink style={{marginLeft:"20px"}} to="/">Home</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/activities">Activities</NavLink>
                        <NavLink style={{marginLeft:"20px"}} to="/create">Create Activity</NavLink>
                        <span style={{marginLeft:"90px"}}>{email}</span>
                        <NavLink to="/logout">Logout</NavLink>
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