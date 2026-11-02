"use client";

import { useAuth } from "@/context/AuthContext"; 
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { EyeIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";

const generateLicenseNumber = (): string => {
  const prefix = "CAR"; 
  const uniquePart = Date.now().toString(36).toUpperCase(); 
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase(); 
  return `${prefix}-${uniquePart}-${randomPart}`;
};

function Signup() {
  const { setToken, setRole, setData } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    licenseNumber: generateLicenseNumber(),
    expiryDate: "",
    country: "",
    city: "",
    dateOfBirth: "",
    role: "",
    sellerType: "",
    isAdmin: false,
    isSuperAdmin: false,
  });

  const [showPassword, setShowPassword] = useState(false); 
  const [showCPassword, setShowCPassword] = useState(false); 

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleCPasswordVisibility = () => {
    setShowCPassword((prevState) => !prevState);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
  ) => {
    if (typeof e === "string") {
      setFormData((prevData) => ({ ...prevData, phone: e }));
      setFieldErrors((prevErrors) => ({ ...prevErrors, phone: false })); 
    } else {
      const { id, value } = e.target;
      if (id === "role") {
        // If the role is Admin, set sellerType to Dealer, else match it to the role
        setFormData((prevData) => ({
          ...prevData,
          [id]: value,
          sellerType: value === "Admin" ? "Dealer" : value,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [id]: value,
        }));
      }
      setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: false })); 
    }
  };

  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
    name: false,
    phone: false,
    role: false,
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      email: !formData.email,
      password: !formData.password,
      name: !formData.name,
      phone: !formData.phone,
      role: !formData.role,
    };
    setFieldErrors(errors);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      // API call for signup
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/users/signup`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          // licenseNumber: formData.licenseNumber || null,
          licenseNumber: generateLicenseNumber() || "ab",
          expiryDate: formData.expiryDate || "2025-05-15",
          country: formData.country,
          city: formData.city,
          dateOfBirth: formData.dateOfBirth || null,
          role: formData.role,
          sellerType: formData.sellerType || "Dealer",
          isAdmin: formData.isAdmin,
          isSuperAdmin: formData.isSuperAdmin,
        }
      );

      // Handle signup success
      const { token, role } = response.data;
      setToken(token);
      localStorage.setItem("token", token);
      setRole(role);
      localStorage.setItem("role", role);
      setData(response.data.data);
      localStorage.setItem("data", response.data.data);

      toast.success("Account created successfully!");

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        licenseNumber: "",
        expiryDate: "",
        country: "",
        city: "",
        dateOfBirth: "",
        role: "",
        sellerType: "",
        isAdmin: false,
        isSuperAdmin: false,
      });

      // Redirect to dashboard
      // router.push("/dashboard");
      router.push("/signIn");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex h-screen flex-col sm:flex-row">
      {/* Left Section */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center relative sm:block sm:h-full hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/SignUp.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>

        <div
          className="hidden sm:block absolute top-1/2 left-4 transform -translate-y-1/2 z-10 text-white text-3xl font-bold"
          style={{ textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)" }}
        >
          AutoExchange is the best place to find remote talent. We’ve been super
          impressed by the quality of applicants.
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-gray-100 px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/autoExchange logo.png"
              alt="Logo"
              width={150}
              height={50}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
            Create an account
          </h2>
          <p className="text-gray-500 mb-4 sm:mb-6 text-center">
            Let`s get started
          </p>

          {(fieldErrors.email ||
            fieldErrors.name ||
            fieldErrors.password ||
            fieldErrors.phone) && (
            <p className="text-red-500 text-sm mt-1">Fields are required.</p>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                className={`w-full border rounded-md p-2 shadow-md text-black ${
                  fieldErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`w-full border rounded-md p-2 shadow-md text-black ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} // Toggle between text and password
                  id="password"
                  className={`w-full border rounded-md p-2 shadow-md text-black ${
                    fieldErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showCPassword ? "text" : "password"}
                  className={`w-full border rounded-md p-2 shadow-md text-black ${
                    fieldErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={toggleCPasswordVisibility}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 mb-2">
                Phone
              </label>
              <PhoneInput
                country={"au"} // Default country set to Australia
                value={formData.phone}
                onChange={(phone) => handleChange(phone)} 
                inputStyle={{
                  width: "100%",
                  padding: "10px 10px 10px 50px", 
                  border: `1px solid ${
                    fieldErrors.phone ? "red" : "#ccc" 
                  }`,
                  borderRadius: "5px", 
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  color: "#000", 
                }}
                containerStyle={{
                  width: "100%",
                }}
                dropdownStyle={{
                  color: "#000", 
                }}
              />
              {fieldErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* User Role */}
            <div className="mb-6">
              <label htmlFor="role" className="block text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                className="w-full border border-gray-300 rounded-md p-2 shadow-md text-black"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                {/* <option value="Admin">Admin</option> */}
                <option value="Dealer">Dealer</option>
                <option value="Company">Company</option>
              </select>
              {fieldErrors.role && (
                <p className="text-red-500 text-sm mt-1">Role is required.</p>
              )}
            </div>

            <button
              type="submit"
              className="bg-black text-white w-full py-2 rounded-md text-sm mb-4 transition-all duration-300 hover:bg-gray-500"
            >
              Create Account
            </button>

            <p className="text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <a
                href="/signIn"
                className="text-blue-500 underline hover:text-[#F83D3D]"
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
