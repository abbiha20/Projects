"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const defaultFormData = {
  name: "",
  designation: "",
  specialization: "",
  contact: "",
  landline: "",
  address: "",
  hospitalId: "",
};

export default function ConsultantFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = defaultFormData,
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on input change
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required.";
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialization is required.";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required.";

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

        <h2 className="text-2xl font-bold mb-2">Consultant Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit Consultant</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name Field */}
          <div className="flex flex-col">
            <label className="text-black">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}
          </div>

          {/* Designation Field */}
          <div className="flex flex-col">
            <label className="text-black">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.designation ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.designation && (
              <span className="text-red-500 text-sm">{errors.designation}</span>
            )}
          </div>

          {/* Specialization Field */}
          <div className="flex flex-col">
            <label className="text-black">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.specialization ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.specialization && (
              <span className="text-red-500 text-sm">
                {errors.specialization}
              </span>
            )}
          </div>

          {/* Contact Field */}
          <div className="flex flex-col">
            <label className="text-black">Contact</label>
            <PhoneInput
              country={"pk"}
              value={formData.contact}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, contact: value }));
                setErrors((prev) => ({ ...prev, contact: "" })); // Clear error
              }}
              inputStyle={{
                width: "100%",
                height: "38px",
                paddingLeft: "48px",
                border: errors.contact ? "1px solid red" : "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              containerStyle={{ width: "100%" }}
              enableSearch
            />
            {errors.contact && (
              <span className="text-red-500 text-sm">{errors.contact}</span>
            )}
          </div>

          {/* Landline Field */}
          <div className="flex flex-col">
            <label className="text-black">Landline</label>
            <input
              type="text"
              name="landline"
              value={formData.landline}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full border-gray-300"
            />
          </div>

          {/* Address Field */}
          <div className="flex flex-col col-span-full">
            <label className="text-black">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full border-gray-300"
            />
          </div>

          {/* Hospital ID Field */}
          <div className="flex flex-col">
            <label className="text-black">Hospital ID</label>
            <input
              type="text"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full border-gray-300"
            />
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