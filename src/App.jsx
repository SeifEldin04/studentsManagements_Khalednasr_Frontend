import React, { use, useContext, useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Components/Layout/Layout'
import "jquery/dist/jquery.min.js";
import 'remixicon/fonts/remixicon.css'
import Home from './pages/Home/Home'
import Centers from './pages/Centers/Centers'
import Signup from './pages/Signup/Signup'
import Login from './pages/Login/Login'
import { UserContext } from './Context/UserContext.jsx';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx';
import Students from './pages/Students/students.jsx';
import StudentsDegrees from './pages/StudentsDegrees/StudentsDegrees.jsx';
import ExamScores from './pages/ExamScores/ExamScores.jsx';
import Attendance from './pages/Attendance/Attendance.jsx';


const App = () => {
  const { setUserToken } = useContext(UserContext)

  let routers = createBrowserRouter([
    {
      path: '', element: < Layout />, children: [
        { index: true, element: <ProtectedRoute> <Home /> </ProtectedRoute> },
        { path: '/centers', element: <ProtectedRoute> <Centers /> </ProtectedRoute> },
        { path: '/students', element: <ProtectedRoute> <Students /> </ProtectedRoute> },
        { path: '/studentsDegrees', element: <ProtectedRoute> <StudentsDegrees /> </ProtectedRoute> },
        { path: '/examScores', element: <ProtectedRoute> <ExamScores /> </ProtectedRoute> },
        { path: '/attendance', element: <ProtectedRoute> <Attendance /> </ProtectedRoute> },
        { path: '/signup', element: <Signup /> },
        { path: '/login', element: <Login /> },

      ]
    }
  ])

  useEffect(() => {
    if (localStorage.getItem('khalednasrSiteToken') !== null) {
      setUserToken(localStorage.getItem('khalednasrSiteToken'))
    }
  }, [])

  return <>
    <RouterProvider router={routers}></RouterProvider>
  </>
}

export default App
