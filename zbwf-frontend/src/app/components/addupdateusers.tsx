"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { EyeIcon } from "@heroicons/react/24/outline";
import "react-phone-input-2/lib/style.css";

const defaultFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  status: "",
  password: "",
  confirmPassword: "",
};

export default function UsersFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = defaultFormData,
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on input change
  };

  const validateForm = () => {
    const newErrors: any = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required.`;
      }
    });

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-2">Users Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit User</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name Field */}
          <div className="flex flex-col">
            <label className="text-black">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <span className="text-red-500 text-sm">{errors.firstName}</span>
            )}
          </div>

          {/* Last Name Field */}
          <div className="flex flex-col">
            <label className="text-black">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <span className="text-red-500 text-sm">{errors.lastName}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label className="text-black">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email}</span>
            )}
          </div>

          {/* Phone Field */}
          <div className="flex flex-col">
            <label className="text-black">Phone</label>
            <PhoneInput
              country={"pk"} // Change to your desired default country code
              value={formData.phone}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, phone: value }));
                setErrors((prev) => ({ ...prev, phone: "" })); // Clear error on input change
              }}
              inputStyle={{
                width: "100%",
                height: "38px",
                paddingLeft: "48px",
                border: errors.phone ? "1px solid red" : "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              containerStyle={{ width: "100%" }}
              enableSearch
            />
            {errors.phone && (
              <span className="text-red-500 text-sm">{errors.phone}</span>
            )}
          </div>

          {/* Role Field */}
          <div className="flex flex-col">
            <label className="text-black">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Lab Officer">Lab Officer</option>
            </select>
            {errors.role && (
              <span className="text-red-500 text-sm">{errors.role}</span>
            )}
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  status: formData.status === "Enable" ? "Disable" : "Enable",
                })
              }
              className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
                formData.status === "Enable" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform bg-white rounded-full shadow-md transition-transform duration-300 ${
                  formData.status === "Enable"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-2 font-medium text-gray-700">
              {formData.status === "Enable" ? "Enabled" : "Disabled"}
            </span>
            {errors.status && (
              <span className="text-red-500 text-sm mt-2">{errors.status}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                placeholder="•••••••••••••"
                onChange={handleInputChange}
                className="w-full border p-2 rounded-lg text-black border-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="•••••••••••••"
                onChange={handleInputChange}
                className="w-full border p-2 rounded-lg text-black border-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 hover:text-blue-500 transition duration-200"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">
                {errors.confirmPassword}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-10 py-3 rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-10 py-3 rounded-lg hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
