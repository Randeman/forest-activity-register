import { Link, NavLink } from "react-router-dom";
import React from "react";

function Navigation() {
    return (
        <Link style={{marginLeft:"30px"}}>
            <NavLink style={{marginLeft:"20px"}} to="/">Home</NavLink>
            <NavLink style={{marginLeft:"20px"}} to="/activities">Activities</NavLink>
            <NavLink style={{marginLeft:"20px"}} to="/create">Create Activity</NavLink>
        </Link>
    );
}

export default Navigation;