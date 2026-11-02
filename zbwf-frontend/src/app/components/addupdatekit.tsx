"use client";

import { useState } from "react";

const defaultFormData = {
  lotNumber: "",
  kitNumber: "",
  receivingDate: "",
  openingDate: "",
  closingDate: "",
  numberOfKits: "",
  babiesScreened: "",
  wastage: "",
};

export default function KitFormModal({
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
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
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

        <h2 className="text-2xl font-bold mb-2">Kit Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit Kit</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Kit Number Field */}
          <div className="flex flex-col">
            <label className="text-black">Kit Number</label>
            <input
              type="text"
              name="kitNumber"
              value={formData.kitNumber}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.kitNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.kitNumber && (
              <span className="text-red-500 text-sm">{errors.kitNumber}</span>
            )}
          </div>

          {/* Receiving Date Field */}
          <div className="flex flex-col">
            <label className="text-black">Receiving Date</label>
            <input
              type="date"
              name="receivingDate"
              value={formData.receivingDate}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.receivingDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.receivingDate && (
              <span className="text-red-500 text-sm">{errors.receivingDate}</span>
            )}
          </div>

          {/* Opening Date Field */}
          <div className="flex flex-col">
            <label className="text-black">Opening Date</label>
            <input
              type="date"
              name="openingDate"
              value={formData.openingDate}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.openingDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.openingDate && (
              <span className="text-red-500 text-sm">{errors.openingDate}</span>
            )}
          </div>

          {/* Closing Date Field */}
          <div className="flex flex-col">
            <label className="text-black">Closing Date</label>
            <input
              type="date"
              name="closingDate"
              value={formData.closingDate}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.closingDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.closingDate && (
              <span className="text-red-500 text-sm">{errors.closingDate}</span>
            )}
          </div>

          {/* Number of Kits Field */}
          <div className="flex flex-col">
            <label className="text-black">Number of Kits</label>
            <input
              type="number"
              name="numberOfKits"
              value={formData.numberOfKits}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.numberOfKits ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.numberOfKits && (
              <span className="text-red-500 text-sm">{errors.numberOfKits}</span>
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
              <span className="text-red-500 text-sm">{errors.babiesScreened}</span>
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