"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const defaultFormData = {
  name: "",
  region: "",
  city: "",
  address: "",
  contact: "",
  contactPerson: "",
  officialEmail: "",
};

export default function HospitalFormModal({
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
    if (!formData.region.trim()) newErrors.region = "Region is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required.";
    if (!formData.contactPerson.trim())
      newErrors.contactPerson = "Contact person is required.";
    if (!formData.officialEmail.trim())
      newErrors.officialEmail = "Official email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.officialEmail))
      newErrors.officialEmail = "Invalid email format.";

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

        <h2 className="text-2xl font-bold mb-2">Hospital Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit Hospital</p>

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

          {/* Region Field */}
          <div className="flex flex-col">
            <label className="text-black">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.region ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.region && (
              <span className="text-red-500 text-sm">{errors.region}</span>
            )}
          </div>

          {/* City Field */}
          <div className="flex flex-col">
            <label className="text-black">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.city && (
              <span className="text-red-500 text-sm">{errors.city}</span>
            )}
          </div>

          {/* Address Field */}
          <div className="flex flex-col col-span-full">
            <label className="text-black">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <span className="text-red-500 text-sm">{errors.address}</span>
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

          {/* Contact Person Field */}
          <div className="flex flex-col">
            <label className="text-black">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.contactPerson ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.contactPerson && (
              <span className="text-red-500 text-sm">
                {errors.contactPerson}
              </span>
            )}
          </div>

          {/* Official Email Field */}
          <div className="flex flex-col">
            <label className="text-black">Official Email</label>
            <input
              type="email"
              name="officialEmail"
              value={formData.officialEmail}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.officialEmail ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.officialEmail && (
              <span className="text-red-500 text-sm">
                {errors.officialEmail}
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