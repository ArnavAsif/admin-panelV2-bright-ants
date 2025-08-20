
import Navbar from './Navbar';
import { Outlet } from 'react-router';
import Sidebar from './SideBar/Sidebar';

const HomePage = () => {
    return (
        <div className='grid grid-cols-5 min-h-screen'>
            
            <div className='col-span-1'>
                <Sidebar></Sidebar>
            </div>

            <div className='col-span-4 bg-blue-100 flex flex-col'>
                <Navbar />
                <div className='p-4 flex-grow'>
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    );
};

export default HomePage;