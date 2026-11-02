"use client";

import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { addPatient, updatePatient } from "../api/patient";
import { toast } from "react-toastify";

const defaultFormData = {
  name: "",
  age: "",
  gender: "",
  mothersName: "",
  fathersName: "",
  hospital: "",
  doctor: "",
  region: "",
  city: "",
  mobileNo1: "",
  dateOfBirth: "",
  landline: "",
  mobileNo2: "",
  email: "",
  address: "",
  visitNo: "",
  collectionDate: "",
  receiveDate: "",
  bookingDate: "",
  test: "",
  status: "",
  resultDate: "",
  resultValue: "",
  multipleBirth: "",
};

export default function PatientFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = defaultFormData,
}) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData); // Apply initialData when modal is opened
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateFields = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateFields()) {
      try {
        console.log("Form Data:", JSON.stringify(initialData));
        if (initialData.patientId) {
          await updatePatient(initialData.patientId, formData); // Call update API
          toast.success("Patient updated successfully");
        } else {
          await addPatient(formData); // Call add API
          toast.success("Patient added successfully");
        }
      } catch (error: any) {
        toast.error("Failed to save patient data: " + error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-2">Patient Form</h2>
        <p className="text-red-500 font-bold mb-6">━━━━ Add / Edit Patient</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-black">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`p-2 border rounded-md text-black w-full ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-black">Age</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-black">Mother’s Name</label>
            <input
              type="text"
              name="mothersName"
              value={formData.mothersName}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Father’s Name</label>
            <input
              type="text"
              name="fathersName"
              value={formData.fathersName}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Hospital</label>
            <input
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Doctor</label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Phone Number 1</label>
            <PhoneInput
              country={"pk"}
              value={formData.mobileNo1}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, mobileNo1: value }))
              }
              inputStyle={{
                width: "100%",
                height: "38px",
                paddingLeft: "48px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              containerStyle={{ width: "100%" }}
              enableSearch
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Landline</label>
            <input
              type="text"
              name="landline"
              value={formData.landline}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Phone Number 2</label>
            <PhoneInput
              country={"pk"}
              value={formData.mobileNo2}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, mobileNo2: value }))
              }
              inputStyle={{
                width: "100%",
                height: "38px",
                paddingLeft: "48px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              containerStyle={{ width: "100%" }}
              enableSearch
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`p-2 border rounded-md text-black w-full ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col col-span-full">
            <label className="text-black">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Visit No</label>
            <input
              type="text"
              name="visitNo"
              value={formData.visitNo}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Collection Date</label>
            <input
              type="date"
              name="collectionDate"
              value={formData.collectionDate}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Receive Date</label>
            <input
              type="date"
              name="receiveDate"
              value={formData.receiveDate}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Booking Date</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Test</label>
            <input
              type="text"
              name="test"
              value={formData.test}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Status</label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Result Date</label>
            <input
              type="date"
              name="resultDate"
              value={formData.resultDate}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Result Value</label>
            <input
              type="text"
              name="resultValue"
              value={formData.resultValue}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black">Multiple Birth</label>
            <select
              name="multipleBirth"
              value={formData.multipleBirth}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-black w-full"
            >
              <option value="none">None</option>
              <option value="twin">Twin</option>
              <option value="triplet">Triplet</option>
              <option value="quadruplet">Quadruplet</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap space-x-8 items-center">
          <label className="text-black font-bold">
            Select in case of Twins or Triplet:
          </label>
          {["twins", "triplets", "none"].map((val) => (
            <label key={val} className="flex items-center space-x-2">
              <input
                type="radio"
                value={val}
                checked={formData.multipleBirth === val}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    multipleBirth: e.target.value,
                  }))
                }
                className="w-6 h-6 border-2 border-black appearance-none rounded-full checked:bg-black"
              />
              <span className="text-black capitalize">{val}</span>
            </label>
          ))}
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