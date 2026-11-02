"use client";

import { useState } from "react";

const defaultFormData = {
  name: "",
  unit: "",
  normalRange: "",
  cost: "",
};

export default function TestFormModal({
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
    if (!formData.unit.trim()) newErrors.unit = "Unit is required.";
    if (!formData.normalRange.trim())
      newErrors.normalRange = "Normal Range is required.";
    if (!formData.cost.trim()) newErrors.cost = "Cost is required.";

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

        <h2 className="text-2xl font-bold mb-2">Test Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit Test</p>

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

          {/* Unit Field */}
          <div className="flex flex-col">
            <label className="text-black">Unit</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.unit ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.unit && (
              <span className="text-red-500 text-sm">{errors.unit}</span>
            )}
          </div>

          {/* Normal Range Field */}
          <div className="flex flex-col">
            <label className="text-black">Normal Range</label>
            <input
              type="text"
              name="normalRange"
              value={formData.normalRange}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.normalRange ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.normalRange && (
              <span className="text-red-500 text-sm">{errors.normalRange}</span>
            )}
          </div>

          {/* Cost Field */}
          <div className="flex flex-col">
            <label className="text-black">Cost</label>
            <input
              type="text"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              className={`p-2 border rounded-md w-full ${
                errors.cost ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.cost && (
              <span className="text-red-500 text-sm">{errors.cost}</span>
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