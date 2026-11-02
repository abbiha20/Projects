"use client";

import { useState } from "react";

const defaultFormData = {
  cardName: "",
  hospital: "",
  dispatchDate: "",
  splitFull: "",
  type: "",
  babiesScreened: "",
  wastage: "",
  purpose: "",
};

export default function CardFormModal({
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

        <h2 className="text-2xl font-bold mb-2">Card Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit Card</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Name Field */}
          <div className="flex flex-col">
            <label className="text-black">Card Name</label>
            <input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.cardName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.cardName && (
              <span className="text-red-500 text-sm">{errors.cardName}</span>
            )}
          </div>

          {/* Hospital Field */}
          <div className="flex flex-col">
            <label className="text-black">Hospital</label>
            <input
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.hospital ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.hospital && (
              <span className="text-red-500 text-sm">{errors.hospital}</span>
            )}
          </div>

          {/* Dispatch Date Field */}
          <div className="flex flex-col">
            <label className="text-black">Dispatch Date</label>
            <input
              type="date"
              name="dispatchDate"
              value={formData.dispatchDate}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.dispatchDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.dispatchDate && (
              <span className="text-red-500 text-sm">
                {errors.dispatchDate}
              </span>
            )}
          </div>

          {/* Split/Full Field (Radio Buttons) */}
          <div className="mt-6 flex flex-wrap space-x-8 items-center">
            <label className="text-black ">Split/Full:</label>
            {["Split", "Full"].map((val) => (
              <label key={val} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={val}
                  checked={formData.splitFull === val}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      splitFull: e.target.value,
                    }))
                  }
                  className="w-6 h-6 border-2 border-black appearance-none rounded-full checked:bg-black"
                />
                <span className="text-black capitalize">{val}</span>
              </label>
            ))}
            {errors.splitFull && (
              <span className="text-red-500 text-sm">{errors.splitFull}</span>
            )}
          </div>

          {/* Type Field (Dropdown) */}
          <div className="flex flex-col">
            <label className="text-black">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Type</option>
              <option value="Metabolic">Metabolic</option>
              <option value="TSH">TSH</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && (
              <span className="text-red-500 text-sm">{errors.type}</span>
            )}
          </div>

          {/* Babies Screened Field */}
          <div className="flex flex-col">
            <label className="text-black">Babies Screened</label>
            <input
              type="number"
              name="babiesScreened"
              value={formData.babiesScreened}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.babiesScreened ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.babiesScreened && (
              <span className="text-red-500 text-sm">
                {errors.babiesScreened}
              </span>
            )}
          </div>

          {/* Wastage Field */}
          <div className="flex flex-col">
            <label className="text-black">Wastage</label>
            <input
              type="number"
              name="wastage"
              value={formData.wastage}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.wastage ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.wastage && (
              <span className="text-red-500 text-sm">{errors.wastage}</span>
            )}
          </div>

          {/* Purpose Field */}
          <div className="flex flex-col">
            <label className="text-black">Purpose</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.purpose ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.purpose && (
              <span className="text-red-500 text-sm">{errors.purpose}</span>
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
