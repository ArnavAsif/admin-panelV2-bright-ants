import { NavLink } from 'react-router';
import logo from '../../logo/BA logo Profile image Final 1.svg'
import {
    FaTachometerAlt,
    FaImages,
    FaQuoteRight,
    FaTags,
    FaGavel,
    FaBriefcase,
    FaEnvelope,
    FaSignOutAlt,
    FaVideo,
} from 'react-icons/fa';
import { useAuth } from '../auth/AuthProvider';

const Sidebar = () => {
    const { logout } = useAuth();
    return (
        <div className="h-screen flex flex-col justify-between p-4 shadow-md sticky top-0 ">
            {/* Top Section */}
            <div>
                {/* Profile Picture */}
                <div className="flex items-center  mb-4">
                    
                    <img
                        src={logo}
                        alt="Profile"
                        className="rounded-full w-10 h-10 object-cover"
                    />
                </div>

                <hr className="border-gray-400 mb-4" />

                {/* Navigation Links */}
                <nav className="flex flex-col gap-3">
                    <NavItem to="/" icon={<FaTachometerAlt />} label="Dashboard" />
                    <NavItem to="/carousel" icon={<FaImages />} label="Carousel" />
                    <NavItem to="/testimonial" icon={<FaQuoteRight />} label="Testimonial" />
                    <NavItem to="/promotions" icon={<FaTags />} label="Promotional Offers" />
                    <NavItem to="/videoAdmin" icon={<FaVideo />} label="VideoAdmin" />
                    <NavItem to="/attorney" icon={<FaGavel />} label="Attorney" />
                    <NavItem to="/work" icon={<FaBriefcase />} label="Work" />
                    <NavItem to="/contact" icon={<FaEnvelope />} label="Contact Us" />
                </nav>
            </div>

            {/* Logout */}
            <div>
                <button
                        onClick={logout}
                        className="flex items-center w-full p-3 hover:bg-indigo-700 rounded-lg"
                    >
                        <FaSignOutAlt />
                        <span className="ml-3">Logout</span>
                    </button>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label, className = '' }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md hover:bg-amber-400 transition-colors ${isActive ? 'bg-amber-500 font-semibold' : ''
                } ${className}`
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
};

export default Sidebar;
