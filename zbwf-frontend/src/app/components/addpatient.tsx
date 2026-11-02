"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";
import { addPatient, getPatientById, updatePatient } from "../api/patient";

function AddPatient({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    if (patientId) {
      getPatientById(patientId)
        .then((data) => setFormData(data))
        .catch(() => toast.error("Failed to fetch patient data"));
    }
  }, [patientId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (patientId) {
        await updatePatient(patientId, formData);
        toast.success("Patient updated successfully");
      } else {
        await addPatient(formData);
        toast.success("Patient added successfully");
      }
      router.push("/patientMan");
    } catch {
      toast.error("Failed to save patient data");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between flex-wrap">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-black">Add Patient</h1>
          <p className="text-red-500 font-bold">━━━━ Add Patient Form</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="flex flex-col">
          <label className="text-black">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter Name"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black">Mother`s Name</label>
          <input
            type="text"
            name="mothersName"
            value={formData.mothersName}
            onChange={handleInputChange}
            placeholder="Enter Name"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black">Father/Gardian`s Name</label>
          <input
            type="text"
            name="fathersName"
            value={formData.fathersName}
            onChange={handleInputChange}
            placeholder="Enter Name"
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-black mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <hr className="my-6 border-black" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-black mb-1">Hospital</label>
          <select
            name="hospital"
            value={formData.hospital}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="" disabled>
              Select Hospital
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-black mb-1">Consultant</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="" disabled>
              Select Constultant
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-black mb-1">Region</label>
          <select
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="" disabled>
              Select Region
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-black mb-1">City</label>
          <select
            name="cith"
            value={formData.city}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="" disabled>
              Select City
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-black">Phone Number 1</label>
          <PhoneInput
            country={"pk"}
            value={formData.mobileNo1}
            onChange={(mobileNo1) =>
              handleInputChange({
                target: { name: "phone", value: mobileNo1 },
              })
            }
            inputStyle={{
              width: "100%",
              height: "38px",
              paddingLeft: "48px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "#fff",
              color: "#000",
            }}
            containerStyle={{
              width: "100%",
            }}
            buttonStyle={{
              borderTopLeftRadius: "6px",
              borderBottomLeftRadius: "6px",
            }}
            dropdownStyle={{
              color: "#000",
            }}
            enableSearch={true}
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
          <label className="text-black">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          />
        </div>

        <div className="flex flex-col">
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
          <label className="text-black">Test Selection</label>
          <select
            name="test"
            value={formData.test}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="">Select a test</option>
            <option value="TSH">TSH</option>
            <option value="G6PD">G6PD</option>
            <option value="17OHP">17OHP</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-black">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="p-2 border rounded-md text-black w-full"
          >
            <option value="">Select status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
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
      </div>

      <div className="mt-6 flex flex-wrap space-x-8 items-center">
        <label className="text-black font-bold">
          Select in case of Twins or Triplet:
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="twins"
            checked={formData.multipleBirth === "twins"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                multipleBirth: e.target.value,
              }))
            }
            className="w-6 h-6 border-2 border-black appearance-none rounded-full checked:bg-black checked:border-black"
          />
          <span className="text-black">Twins</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="triplets"
            checked={formData.multipleBirth === "triplets"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                multipleBirth: e.target.value,
              }))
            }
            className="w-6 h-6 border-2 border-black appearance-none rounded-full checked:bg-black checked:border-black"
          />
          <span className="text-black">Triplets</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="none"
            checked={formData.multipleBirth === "none"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                multipleBirth: e.target.value,
              }))
            }
            className="w-6 h-6 border-2 border-black appearance-none rounded-full checked:bg-black checked:border-black"
          />
          <span className="text-black">None</span>
        </label>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-14 py-3 rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
        <a
          href="/patientMan"
          className="bg-red-500 text-white px-14 py-3 rounded-lg hover:bg-red-600 block text-center"
        >
          Close
        </a>
      </div>
    </div>
  );
}

export default AddPatient;
