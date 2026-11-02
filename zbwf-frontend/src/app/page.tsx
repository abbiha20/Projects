"use client";

import { useAuth } from "@/context/AuthContext"; // Import Auth context
import Dashboard from "./components/dashboard";
import Sidebar from "./components/sidebar";
import Signin from "./components/signin"; // Import the Signin component
import { useState, useEffect } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token } = useAuth(); // Get token from Auth context

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); // Toggle the sidebar state
  };

  
  // If no token and not showing the portfolio page, render the Signin component
  if (!token) {
  <Signin />;
  }


  // Render the main application if the token exists
  return (
    <div className="relative flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ease-in-out ${
          sidebarOpen ? "overflow-hidden" : ""
        }`}
      >
        {!sidebarOpen && (
          <button
            className="fixed lg:hidden z-90 bottom-10 right-8 bg-teal-800 w-10 h-10 rounded-full drop-shadow-lg flex justify-center items-center text-white text-4xl hover:bg-teal-800 duration-300"
            onClick={toggleSidebar}
          >
            <span className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="w-6 m-auto"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708zm0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708z"
                />
              </svg>
            </span>
          </button>
        )}
        <Dashboard />
      </div>
    </div>
  );
}
