/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "./modaldeleteadmin";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { EyeIcon } from "@heroicons/react/24/outline";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  licenseNumber?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  role?: string;
  expiryDate?: string;
  sellerType?: string;
}

function Adminmanager() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false); 
  const [showCPassword, setShowCPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleCPasswordVisibility = () => {
    setShowCPassword((prevState) => !prevState);
  };

  const [formData, setFormData] = useState({
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
    sellerType: "Dealer",
    isAdmin: false,
    isSuperAdmin: false,
  });

  const { token, role } = useAuth();
  console.log("token in admin:", token)
  const router = useRouter();

  useEffect(() => {
    if (role !== "Admin" && role !== "SuperAdmin") {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [role]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchUsers = async () => {
      console.log("token here:", token);

      // if (!token) {
      //   console.error("No token available");
      //   return;
      // }

      setLoading(true);

      try {
        if (role === "Admin" || role === "SuperAdmin") {
          const response = await axios.get(
            // `${process.env.NEXT_PUBLIC_HOST}/admin/users`,
            `${process.env.NEXT_PUBLIC_HOST}/admin/users/fetchUsers?page=${currentPage}&limit=${rowsPerPage}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // console.log("Respoonessee: ",response)
          // console.log("Respoonessee: ", response.data.data.data)
          setUsers(response.data.data.data);
          // console.log("Res:", response.data.data)
          setTotalUsers(response.data.data.totalPages);
          // setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        // setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if(token){
      fetchUsers();
    }
  }, [token, isAuthorized, role, currentPage, rowsPerPage]);

  if (!isAuthorized) {
    return <></>;
  }

  const openModal = (user?: any) => {
    setIsEditMode(!!user);
    setId(user?.id || "");
    setFormData(
      user
        ? {
            ...user,
            role: user.role || "Dealer",
            expiryDate: user.expiryDate || "2025-05-15",
            sellerType: user.sellerType || "Dealer",
            password: "",
            confirmPassword: "",
          }
        : {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            licenseNumber: "",
            expiryDate: "2025-05-15",
            country: "",
            city: "",
            dateOfBirth: "",
            role: "",
            sellerType: "Dealer",
            isAdmin: false,
            isSuperAdmin: false,
          }
    );
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;

    // Reset the error for the specific field
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "", 
      }));
    }

    setFormData({ ...formData, [name]: value });
  };

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  const handlePageChange = (page: string | number) => {
    if (page === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (page === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (typeof page === "number" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSubmit = async () => {
    // console.log("handle Submit");

    if (!token) {
      console.error("No token available while submitting");
      return;
    }

    if (!isEditMode && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      expiryDate: formData.expiryDate || "2025-05-15",
      country: formData.country,
      city: formData.city,
      dateOfBirth: formData.dateOfBirth,
      role: formData.role,
      sellerType: formData.sellerType || "Dealer",
      // isAdmin: formData.isAdmin,
      isAdmin: formData.role === "Admin" ? true : formData.isAdmin,
      isSuperAdmin: formData.isSuperAdmin,
    };

    setLoading(true);

    console.log(payload);
    try {
      if (isEditMode) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_HOST}/admin/users/${id}`,
          // formData,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("User updated successfully!");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/admin/users`,
          // formData,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("User added successfully!");
      }

      // Refetch users
      const updatedUsers = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(updatedUsers.data.data);

      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        licenseNumber: "",
        expiryDate: "2025-05-15",
        country: "",
        city: "",
        dateOfBirth: "",
        role: "",
        sellerType: "",
        isAdmin: false,
        isSuperAdmin: false,
      });
    } catch (error) {
      console.error("Error adding/editing user:", error);

      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";

      const duplicateEntryMatch = errorMessage.match(/Duplicate entry '(.+?)'/);
      const duplicateEntryValue = duplicateEntryMatch
        ? duplicateEntryMatch[1]
        : null;

      if (duplicateEntryValue) {
        if (duplicateEntryValue.includes("@")) {
          toast.error(`Email already exists: ${duplicateEntryValue}`);
        } else if (
          /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>_-]+$/.test(duplicateEntryValue)
        ) {
          toast.error(`License number already exists: ${duplicateEntryValue}`);
        } else {
          // toast.error(`User already exists: ${duplicateEntryValue}`);
          toast.error(`Failed to submit data`);
        }
        // toast.error(`Duplicate entry found: ${duplicateEntryValue}`);
      } else {
        toast.error(`Error: ${errorMessage}`);
      }

      // toast.error("Failed to add/edit user!, Please Check License NO");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteUserId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteUserId(null);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId || !token) {
      console.error("No user ID or token available");
      return;
    }

    let delResp;

    try {
      setLoading(true);

      delResp = await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST}/admin/users/${deleteUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Delete user: ", delResp);

      if(delResp?.data?.message === "User deleted successfully"){
        toast.success("User successfully deleted!");
      }
      else if(delResp?.data?.message === "Admins cannot be deleted"){
        toast.error("Admins cannot be deleted!");
      }

      const updatedUsers = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(updatedUsers.data.data);
      // setCurrentPage(1);
    } catch (error) {
      console.error("Error deleting user:", error);
      if(delResp.message)
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  const handleValidation = () => {
    const newErrors: FormErrors = {};

    // Validate required fields
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required.";

    if (!isEditMode) {
      if (!formData.password.trim())
        newErrors.password = "Password is required.";
      if (formData.password.trim() !== formData.confirmPassword.trim())
        newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{6,}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be at least 10 digits.";
    }

    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License Number is required.";

    if (!formData.expiryDate.trim())
      newErrors.expiryDate = "Expiry Date is required.";

    if (!formData.country.trim()) newErrors.country = "Country is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";

    if (!formData.dateOfBirth.trim())
      newErrors.dateOfBirth = "Date of Birth is required.";

    if (!formData.role.trim()) newErrors.role = "Role is required.";

    setErrors(newErrors);

    // Check if there are no errors
    if (Object.keys(newErrors).length === 0) {
      handleSubmit();
    }
  };

  return (
    <div className="p-8 w-full bg-gray-100 text-gray-800">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-blue-500"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Admin Management</h1>
        <button
          className="bg-[#191919] text-white px-6 py-3 rounded-lg mt-4 sm:mt-0"
          onClick={() => openModal()}
        >
          Add New User
        </button>
      </div>

      {/* Users Listings Table */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border relative overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold">Users</h2>
          <div className="flex items-center gap-4">
            <select
              className="border border-gray-300 p-2 rounded-lg text-sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={1}>Rows Per Page: 1</option>
              <option value={5}>Rows Per Page: 5</option>
              <option value={10}>Rows Per Page: 10</option>
              <option value={25}>Rows Per Page: 25</option>
              <option value={50}>Rows Per Page: 50</option>
              <option value={100}>Rows Per Page: 100</option>
            </select>
          </div>
        </div>

        <table className="min-w-full table-auto mt-4">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-4">No.</th>
              <th className="p-4">User Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* {paginatedData.map((user: any, idx: number) => ( */}
            {users.map((user: any, idx: number) => (
              <tr key={user.id} className="border-t text-sm">
                {/* <td className="p-4">{String(idx + 1).padStart(2, "0")}</td> */}
                <td className="p-4">
                  {String((currentPage - 1) * rowsPerPage + idx + 1).padStart(
                    2,
                    "0"
                  )}
                </td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.phone}</td>
                <td className="p-4">
                  <span className="inline-block px-3 py-1 bg-gray-200 text-sm rounded-lg">
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                      onClick={() => openModal(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => openDeleteModal(user.id)}
                    >
                      Delete
                    </button>
                    <ConfirmModal
                      isOpen={isDeleteModalOpen}
                      onClose={closeDeleteModal}
                      onConfirm={confirmDeleteUser}
                      message="Are you sure you want to delete this user?"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <div className="flex justify-center items-center mt-4">
          <button
            className="rounded-md rounded-r-none border border-r-0 border-slate-300 py-2 px-4 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
          >
            &larr;
          </button>

          <div className="flex border border-slate-300">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  className={`px-4 py-2 text-sm ${
                    pageNumber === currentPage
                      ? "bg-slate-800 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            className="rounded-md rounded-l-none border border-l-0 border-slate-300 py-2 px-4 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            &rarr;
          </button>
        </div> */}

        <div className="flex justify-center items-center mt-4">
          {/* Previous Button */}
          <button
            className="rounded-md rounded-r-none border border-r-0 border-slate-300 py-2 px-4 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
          >
            &larr;
          </button>

          {/* Page Numbers */}
          <div className="flex border border-slate-300">
            {/* First Page */}
            {currentPage > 3 ? (
              <button
                className={`px-4 py-2 text-sm ${
                  1 === currentPage
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
            ) : (
              <button
                className={`px-4 py-2 text-sm ${
                  1 === currentPage
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
            )}

            {/* Dots */}
            {currentPage > 4 && (
              <span className="px-4 py-2 text-sm text-slate-600">...</span>
            )}

            {/* Page Numbers */}
            {totalPages > 1 &&
              [...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (pageNumber !== 1 && pageNumber !== totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      className={`px-4 py-2 text-sm ${
                        pageNumber === currentPage
                          ? "bg-slate-800 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

            {/* Dots */}
            {currentPage < totalPages - 3 && (
              <span className="px-4 py-2 text-sm text-slate-600">...</span>
            )}

            {/* Last Page */}
            {currentPage < totalPages - 1 && (
              <button
                className={`px-4 py-2 text-sm ${
                  totalPages === currentPage
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            )}
          </div>

          {/* Next Button */}
          <button
            className="rounded-md rounded-l-none border border-l-0 border-slate-300 py-2 px-4 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md sm:max-w-lg mx-4"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? "Edit User" : "Add New User"}
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleValidation();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className={`w-full border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-lg`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={`w-full border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-lg`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
              </div>

              {!isEditMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-medium mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="•••••••••••••"
                        className={`w-full border ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        } p-2 rounded-lg`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-black font-medium mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="•••••••••••••"
                        className={`w-full border ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        } p-2 rounded-lg`}
                      />
                      <button
                        type="button"
                        onClick={toggleCPasswordVisibility}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-medium mb-1">
                    Phone
                  </label>
                  <PhoneInput
                    country={"au"} // Default country set to Australia
                    value={formData.phone} 
                    onChange={(phone) =>
                      handleChange({
                        target: { name: "phone", value: phone },
                      })
                    } 
                    inputStyle={{
                      width: "100%",
                      height: "40px", 
                      padding: "8px 8px 8px 48px", 
                      border: `1px solid ${
                        errors.phone ? "red" : "#ccc" 
                      }`,
                      borderRadius: "8px", 
                      color: "#000", 
                      fontSize: "14px", 
                      backgroundColor: "#fff", 
                    }}
                    containerStyle={{
                      width: "100%", 
                    }}
                    dropdownStyle={{
                      color: "#000", 
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="License Number"
                    className={`w-full border ${
                      errors.licenseNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    } p-2 rounded-lg`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-medium mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.expiryDate ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-lg`}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-sm">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className={`w-full border ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-lg`}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm">{errors.country}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-medium mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full border ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-lg`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-black font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-lg`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-black font-medium mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full border ${
                    errors.role ? "border-red-500" : "border-gray-300"
                  } p-2 rounded-lg`}
                >
                  <option value="" selected disabled hidden>
                    Select Role
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Dealer">Dealer</option>
                  <option value="Company">Company</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adminmanager;
