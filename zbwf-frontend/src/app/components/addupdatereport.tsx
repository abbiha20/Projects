"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const defaultFormData = {
  patientId: "",
  name: "",
  gender: "",
  mobile: "",
  sample: "",
  origin: "",
  consultant: "",
  test: "",
  result: "",
  kit: "",
  lotNumber: "",
};

export default function ReportFormModal({
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

    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required.`;
      }
    });

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

        <h2 className="text-2xl font-bold mb-2">Report Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit Report</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Patient ID Field */}
          <div className="flex flex-col">
            <label className="text-black">Patient ID</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.patientId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.patientId && (
              <span className="text-red-500 text-sm">{errors.patientId}</span>
            )}
          </div>

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

          {/* Gender Field */}
          <div className="flex flex-col">
            <label className="text-black">Gender</label>
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.gender && (
              <span className="text-red-500 text-sm">{errors.gender}</span>
            )}
          </div>

          {/* Mobile Field */}
          <div className="flex flex-col">
            <label className="text-black">Mobile</label>
            <PhoneInput
              country={"pk"} // Change to your desired default country code
              value={formData.mobile}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, mobile: value }));
                setErrors((prev) => ({ ...prev, mobile: "" })); // Clear error on input change
              }}
              inputStyle={{
                width: "100%",
                height: "38px",
                paddingLeft: "48px",
                border: errors.mobile ? "1px solid red" : "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              containerStyle={{ width: "100%" }}
              enableSearch
            />
            {errors.mobile && (
              <span className="text-red-500 text-sm">{errors.mobile}</span>
            )}
          </div>

          {/* Sample Field */}
          <div className="flex flex-col">
            <label className="text-black">Sample</label>
            <input
              type="text"
              name="sample"
              value={formData.sample}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.sample ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.sample && (
              <span className="text-red-500 text-sm">{errors.sample}</span>
            )}
          </div>

          {/* Origin Field */}
          <div className="flex flex-col">
            <label className="text-black">Origin</label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.origin ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.origin && (
              <span className="text-red-500 text-sm">{errors.origin}</span>
            )}
          </div>

          {/* Consultant Field */}
          <div className="flex flex-col">
            <label className="text-black">Consultant</label>
            <input
              type="text"
              name="consultant"
              value={formData.consultant}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.consultant ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.consultant && (
              <span className="text-red-500 text-sm">{errors.consultant}</span>
            )}
          </div>

          {/* Test Field */}
          <div className="flex flex-col">
            <label className="text-black">Test</label>
            <input
              type="text"
              name="test"
              value={formData.test}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.test ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.test && (
              <span className="text-red-500 text-sm">{errors.test}</span>
            )}
          </div>

          {/* Result Field */}
          <div className="flex flex-col">
            <label className="text-black">Result</label>
            <input
              type="text"
              name="result"
              value={formData.result}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.result ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.result && (
              <span className="text-red-500 text-sm">{errors.result}</span>
            )}
          </div>

          {/* Kit Field */}
          <div className="flex flex-col">
            <label className="text-black">Kit</label>
            <input
              type="text"
              name="kit"
              value={formData.kit}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.kit ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.kit && (
              <span className="text-red-500 text-sm">{errors.kit}</span>
            )}
          </div>

          {/* Lot Number Field */}
          <div className="flex flex-col">
            <label className="text-black">Lot Number</label>
            <input
              type="text"
              name="lotNumber"
              value={formData.lotNumber}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.lotNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lotNumber && (
              <span className="text-red-500 text-sm">{errors.lotNumber}</span>
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
