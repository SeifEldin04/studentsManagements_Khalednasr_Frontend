
import React from 'react'
import { HiOutlineMenuAlt2 } from 'react-icons/hi'
import { FaSun, FaMoon } from 'react-icons/fa'
import { Link } from 'react-router-dom'


const Navbar = ({ toggleDarkMode, darkMode, toggleSidebar }) => {
    return (
        <nav className='fixed z-50 top-0 w-full shadow-md h-16 bg-white dark:bg-black'>
            <div className='px-3 py-3 lg:px-5 lg:pl-3'>
                <div className="flex items-center justify-between">

                    {/* Logo , hamburger tap */}
                    <div className="flex items-center justify-start gap-2 font-bold uppercase text-base sm:text-xl">
                        <button
                            className=' text-sm text-black dark:text-white focus:outline-none-lg p-1'
                            onClick={toggleSidebar}
                        >
                            <HiOutlineMenuAlt2 className='text-2xl' />
                        </button>

                        <Link to="/" className='flex ml-1'>
                            <img src="/khaled2.jpg" width={35} height={35} className="rounded-lg" alt="logo" />
                            <p className="afterLogo relative ml-2 text-slate-950 dark:text-white">Khaled <span className="text-primary">Nasr</span></p>
                        </Link>
                    </div>

                    {/* Darkmode Btn */}
                    <button
                        className='text-slate-950 dark:text-white'
                        onClick={toggleDarkMode}
                    >
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar