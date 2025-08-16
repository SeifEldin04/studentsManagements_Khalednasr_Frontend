
import React, { useContext } from 'react'
import LinkItem from './LinkItem'
import { links } from '../Constants'
import { IoLogOutOutline } from "react-icons/io5";
import { MdOutlineLogin } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';


const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const { userToken, setUserToken } = useContext(UserContext)
    // console.log(userToken);

    const handleClick = () => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false)
        }
    }

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('khalednasrSiteToken');
            setUserToken(null);
            navigate('/login');
        }
    }


    return (
        <aside
            className={`
                fixed top-0 left-0 z-40
                transition-all duration-300 ease-in-out
                border-r ${isSidebarOpen ? 'border-gray-200 dark:border-gray-200' : 'dark:border-0'} bg-primary text-white
                ${isSidebarOpen ? 'w-64' : 'w-20'}
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                2xl:translate-x-0
                h-screen
            `}
        >
            <div className='h-full overflow-y-auto pt-20 px-3 bg-primary'>
                <ul className='space-y-2 font-medium'>
                    {links.map((link, index) => (
                        <LinkItem
                            key={index}
                            {...link}
                            isSidebarOpen={isSidebarOpen}
                            setIsSidebarOpen={setIsSidebarOpen}
                        />
                    ))}

                    <div className={`${userToken !== null ? 'border-t' : ''} border-gray-200 pt-2`}>


                        {userToken !== null ? (
                            <li
                                onClick={handleLogout}
                                className={`flex items-center ${!isSidebarOpen ? 'rounded-full justify-center' : 'rounded-lg'} cursor-pointer p-3 py-4 hover:bg-white hover:text-black`}
                            >
                                <IoLogOutOutline className={`${!isSidebarOpen ? 'text-xl' : 'mr-2'}`} />
                                {isSidebarOpen && 'Log out'}
                            </li>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        to='/signup'
                                        className={`flex items-center ${!isSidebarOpen ? 'rounded-full justify-center' : 'rounded-lg'} cursor-pointer p-3 py-4 hover:bg-white hover:text-black
                    ${location.pathname === '/signup' ? 'bg-white text-black' : (!isSidebarOpen ? 'text-white hover:text-black' : '')}`}
                                        onClick={handleClick}
                                    >
                                        <FaRegUser className={`${!isSidebarOpen ? 'text-xl' : 'mr-2'}`} />
                                        {isSidebarOpen && 'Sign up'}
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to='/login'
                                        className={`flex items-center ${!isSidebarOpen ? 'rounded-full justify-center' : 'rounded-lg'} cursor-pointer p-3 py-4 hover:bg-white hover:text-black
                    ${location.pathname === '/login' ? 'bg-white text-black' : (!isSidebarOpen ? 'text-white hover:text-black' : '')}`}
                                        onClick={handleClick}
                                    >
                                        <MdOutlineLogin className={`${!isSidebarOpen ? 'text-xl' : 'mr-2'}`} />
                                        {isSidebarOpen && 'Login'}
                                    </Link>
                                </li>
                            </>
                        )}

                    </div>
                </ul>
            </div>
        </aside>
    )
}

export default Sidebar