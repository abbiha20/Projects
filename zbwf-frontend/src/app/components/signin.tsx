"use client";

import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { EyeIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

function Signin() {
  const { setToken, setRole, setData } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false); 

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    // Clear error for the field being edited
    setFieldErrors((prevErrors) => ({ ...prevErrors, [id]: false }));
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      email: !formData.email,
      password: !formData.password,
    };

    setFieldErrors(errors);

    // Check if any errors exist
    if (Object.values(errors).some((error) => error)) {
      toast.error("Please fill in the required fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/login/`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setRole(response.data.role);
        localStorage.setItem("role", response.data.role);
        setData(response.data.data);
        localStorage.setItem("data", JSON.stringify(response.data.data));

        toast.success("Login successful!");
        setFormData({ email: "", password: "" });
        setFieldErrors({ email: false, password: false }); // Reset errors
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex h-screen flex-col sm:flex-row">
      {/* Left Section (hidden on small screens) */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center relative sm:block sm:h-full hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/SignIn.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="relative text-center z-10 flex flex-col items-center justify-center h-full">
          <div className="mb-4">
            <Image
              src="/images/autoExchange logo.png"
              alt="Logo"
              width={150}
              height={50}
            />
          </div>
          {/* <h1 className="text-3xl font-bold text-black mb-4">New Here?</h1> */}
          {/* <h1 className="text-3xl font-bold text-black mb-4">Welcome</h1> */}
          <h1 className="text-3xl font-bold text-black mb-4">Welcome!</h1>
          <p className="text-lg text-black mb-6">
            {/* Sign up and discover a great amount of new opportunities! */}
            Manage your vehicles seamlessly and drive your operations forward.
          </p>
          {/* <a
            href="/signUp"
            className="text-white px-36 py-2 rounded-md text-md transition-all duration-300 bg-[#FD7070] hover:bg-[#F83D3D] block text-center"
          >
            Sign Up
          </a> */}
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center bg-gray-100 px-4 sm:px-0">
        <div className="w-full sm:w-3/4 flex flex-col items-center sm:items-start">
          {/* Logo for small screens */}
          <div className="block sm:hidden mb-6 mt-6 justify-center">
          {/* <div className="block sm:hidden mb-6 mt-6 flex justify-center"> */}
            <Image
              src="/images/autoExchange logo.png"
              alt="Logo"
              width={150}
              height={50}
            />
          </div>

          <h2 className="text-2xl font-bold text-black mb-4 text-center sm:text-left">
            Login to Your Account
          </h2>
          <p className="text-gray-500 mb-6 text-center sm:text-left">
            Let`s get started
          </p>

          {/*
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm mb-4">{successMessage}</p>
          )}

          */}

          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">Email is required.</p>
          )}
          {fieldErrors.password && (
            <p className="text-red-500 text-sm mt-1">Password is required.</p>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`w-full border rounded-md p-2 shadow-md text-black ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
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

            <button
              type="submit"
              className="bg-black text-white w-full py-2 rounded-md text-sm transition-all duration-300 hover:bg-gray-500 mb-4"
            >
              Sign In
            </button>

            {/* Sign Up button for small screens */}
            <a
              href="/signUp"
              className="block sm:hidden text-white py-2 rounded-md text-sm text-center transition-all duration-300 bg-[#FD7070] hover:bg-[#F83D3D] mb-4"
            >
              Sign Up
            </a>

            <p className="text-center mt-4 text-sm">
              <a
                href="/forgotPassword"
                className="text-blue-500 underline hover:text-[#F83D3D]"
              >
                Forgot password?
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signin;
