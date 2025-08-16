// import React, { useState } from 'react'
// import { Link, useLocation } from 'react-router-dom'

// const LinkItem = ({ href, icon: Icon, text,setIsSidebarOpen }) => {
//     const location = useLocation();
//     const isActive = location.pathname === href;

//     return (
//         <li>
//             <Link
//                 className={`flex items-center p-2 ${isActive && 'bg-primary text-white'} text-black dark:text-white rounded-lg hover:bg-primary hover:text-white`}
//                 to={href}
//                 onClick={!setIsSidebarOpen}
//             >
//                 <Icon className="mr-2" />
//                 <span>{text}</span>
//             </Link>
//         </li>
//     )
// }

// export default LinkItem









// import React from 'react'
// import { Link, useLocation } from 'react-router-dom'

// const LinkItem = ({ href, icon: Icon, text, isSidebarOpen, setIsSidebarOpen }) => {
//     const location = useLocation()
//     const isActive = location.pathname === href

//     const handleClick = () => {
//         if (window.innerWidth < 1024) {
//             setIsSidebarOpen(false)
//         }
//     }

//     return (
//         <li>
//             <Link
//                 to={href}
//                 onClick={handleClick}
//                 className={`
//                     flex items-center p-2 rounded-lg transition-colors duration-200
//                     ${isActive ? 'bg-primary text-white' : 'text-black dark:text-white hover:bg-primary hover:text-white'}
//                     ${!isSidebarOpen && 'justify-center'}
//                 `}
//             >
//                 <Icon className={`text-xl ${!isSidebarOpen ? 'text-white' : 'mr-2'}`} />
//                 {isSidebarOpen && <span>{text}</span>}
//             </Link>
//         </li>
//     )
// }

// export default LinkItem










import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserContext } from '../../Context/UserContext'


const LinkItem = ({ href, icon: Icon, text, isSidebarOpen, setIsSidebarOpen }) => {
    const { userToken } = useContext(UserContext)

    const location = useLocation()
    const isActive = location.pathname === href

    const handleClick = () => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false)
        }
    }

    return <>

        {userToken !== null && (
            <li>
                <Link
                    to={href}
                    onClick={handleClick}
                    className={`
                    flex items-center p-3 py-4 ${!isSidebarOpen ? 'rounded-full' : 'rounded-lg'} transition-colors duration-200 hover:bg-white hover:text-black
                    ${isActive ? 'bg-white text-black' : (!isSidebarOpen ? 'text-white hover:text-black' : '')}
                    ${!isSidebarOpen ? 'justify-center' : ''}
                `}
                >
                    <Icon
                        className={`
                        text-xl
                        ${isSidebarOpen ? 'mr-2' : ''}
                    `}
                    />
                    {isSidebarOpen && <span>{text}</span>}
                </Link>
            </li>
        )}
    </>
}

export default LinkItem
