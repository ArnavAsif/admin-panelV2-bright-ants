import React from 'react';

const Navbar = () => {
    return (
        <div className="navbar bg-base-100 shadow-sm p-4 sticky top-0 z-10">
            <div className="navbar-start">
                <a className="btn btn-ghost text-xl">Bright Ants</a>
            </div>
            <div className="navbar-end">
                <a className="btn">Button</a>
            </div>
        </div>
    );
};

export default Navbar;