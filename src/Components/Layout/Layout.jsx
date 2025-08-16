import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  // اقرأ القيمة من localStorage مباشرة
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // أول ما darkMode يتغير، عدّل الكلاس وسجّله في localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="font-quicksand">
      <Navbar
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main
          className={`
            flex-1 pt-16 min-h-screen transition-all bg-gray-100 dark:bg-black
            ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
