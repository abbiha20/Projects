"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

function Sidebar({ isOpen, onToggle }) {
  const { logout, token, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      console.log("No token found");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found in localStorage.");
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/login/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Logout successful
      logout(); // Clears authentication-related data
      toast.success("Logout successful!"); 
      router.push("/signIn");
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data?.message || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to logout. Please try again."
      );
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen flex flex-col bg-gray-900 text-white z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 md:w-64`}
    >
      {/* Close button for small screens */}
      {isOpen && (
        <button
          className="absolute top-4 right-4 text-white text-2xl"
          onClick={() => onToggle(false)}
        >
          &times;
        </button>
      )}
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
      
      
      <Image
            src="/images/LogoSidebar.png"
            alt="Dashboard Icon"
            width={150}
            height={150}
          /> 


      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col flex-grow p-4 space-y-4">
        <a
          href="/dashboard"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/dashboard" ? "bg-pink-600" : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/Dashboard.svg"
            alt="Dashboard Icon"
            width={20}
            height={20}
          />
          <span>Dashboard</span>
        </a>
        
        
        <a
          href="/patientMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/patientMan"
              ? "bg-pink-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/patient.svg"
            alt="Patient Management Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Patient Management</span>
        </a>


        <a
          href="/hospitalMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/hospitalMan"
              ? "bg-pink-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/hospital.svg"
            alt="Hospital Management Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Hospitals Management</span>
        </a>


        <a
          href="/consultantMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/consultantMan"
              ? "bg-pink-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/doctor.svg"
            alt="Doctor Management Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Consultants Management</span>
        </a>


        <a
          href="/testMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/testMan"
              ? "bg-pink-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/test.svg"
            alt="Tests Management Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Tests Management</span>
        </a>


        <a
          href="/reportMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/reportMan"
              ? "bg-pink-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/report.svg"
            alt="Report Management Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Report Management</span>
        </a>


        <a
          href="/cardMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/cardMan"
              ? "bg-pink-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/card.svg"
            alt="Card Management Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Card Management</span>
        </a>


        <a
          href="/kitMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/kitMan"
              ? "bg-pink-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/kit.svg"
            alt="Kit Management Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Kit Management</span>
        </a>

        {/* <a
          href="/sellerManagement"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/sellerManagement"
              ? "bg-blue-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/Seller.svg"
            alt="Seller Management Icon"
            width={20}
            height={20}
          />
          <span>Seller Management</span>
        </a>


        <a
          href="/buyerManagement"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/buyerManagement"
              ? "bg-blue-600"
              : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/Buyer1.svg"
            alt="Buyer Management Icon"
            width={20}
            height={20}
          />
          <span>Buyer Management</span>
        </a>


        {(role === "Admin" || role === "SuperAdmin") && (
          <>
            <hr className="border-gray-700" />
            <a
              href="/adminManager"
              className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
                pathname === "/adminManager"
                  ? "bg-blue-600"
                  : "hover:bg-gray-700"
              }`}
            >
              <Image
                src="/images/Admin.svg"
                alt="Admin Manager Icon"
                width={20}
                height={20}
              />
              <span>Admin Manager</span>
            </a>
          </>
        )} */}


        <hr className="border-gray-700" />
        <a
          href="/userProfile"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/userProfile" ? "bg-pink-600" : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/User.svg"
            alt="User Profile Icon"
            width={20}
            height={20}
          />
          <span>User Profile</span>
        </a>

        <a
          href="/userMan"
          className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
            pathname === "/userMan" ? "bg-pink-600" : "hover:bg-gray-700"
          }`}
        >
          <Image
            src="/images/Users.svg"
            alt="Users Profile Icon"
            width={20}
            height={20}
            className="invert"
          />
          <span>Users Management</span>
        </a>


        
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center bg-pink-500 text-gray-200 py-2 rounded-md hover:bg-gray-800"
        >
          <Image
            src="/images/Logout.svg"
            alt="Logout Icon"
            width={20}
            height={20}
          />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
