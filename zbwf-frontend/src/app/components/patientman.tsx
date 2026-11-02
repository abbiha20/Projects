/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PatientFormModal from "./addupdatepatient";
import ConfirmModalVehicle from "./modaldeletevehicle";
import { fetchPatients, deletePatient } from "../api/patient";

function Patientman() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientTypeSearchTerm, setPatientTypeSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editPatientData, setEditPatientData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchPatients(currentPage, rowsPerPage, searchQuery, patientTypeSearchTerm);
        setPatients(response.patients);
        setTotalPages(response.totalPages);
        console.log("Fetched patients:", response.patients);
      } catch (error) {
        toast.error("Failed to fetch patients");
      }
    };
    fetchData();
  }, [currentPage, rowsPerPage, searchQuery, patientTypeSearchTerm]);

  const filteredPatients = patients.filter((p: any) => {
    const query = searchQuery.toLowerCase();
    const type = patientTypeSearchTerm.toLowerCase();
    return (
      (!query ||
        p.name.toLowerCase().includes(query) ||
        p.hospital.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)) &&
      (!type || p.gender.toLowerCase().includes(type))
    );
  });

  const openDeleteModal = (id: string) => {
    setDeletePatientId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletePatientId(null);
  };

  const confirmDeletePatient = async () => {
    if (!deletePatientId) return;
    try {
      await deletePatient(deletePatientId);
      setPatients((prev) => prev.filter((p: any) => p.patient_id !== deletePatientId));
      toast.success("Patient successfully deleted!");
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete patient");
    }
  };

  const handleEdit = (patient: any) => {
    setEditPatientData({
      patientId: patient.patient_id,
      name: patient.name,
      gender: patient.gender,
      mothersName: patient.mother_name,
      fathersName: patient.father_guardian_name,
      hospital: patient.hospital.hospital_id,
      doctor: patient.consultant.consultant_id,
      region: patient.region,
      city: patient.city,
      mobileNo1: patient.mobile1,
      mobileNo2: patient.mobile2,
      landline: patient.landline,
      email: patient.email,
      visitNo: patient.visit_no,
      collectionDate: patient.collection_date,
      receiveDate: patient.receive_date,
      bookingDate: patient.booking_date,
      dateOfBirth: patient.date_of_birth,
      test: patient.test.test_id,
      resultDate: patient.result_date,
      status: patient.status,
      resultValue: patient.result_value,
      address: patient.address,
      multipleBirth: patient.twins,
    });
    setIsPatientModalOpen(true);
  };

  const handlePageChange = (page: string | number) => {
    if (page === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (page === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (typeof page === "number" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full bg-gray-100 text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Patient Management</h1>
        <button
          onClick={() => {
            setEditPatientData(null);
            setIsPatientModalOpen(true);
          }}
          className="bg-[#191919] text-white px-6 py-3 rounded-lg"
        >
          Add New Patient
        </button>
        <PatientFormModal
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          initialData={editPatientData || {}}
          onSave={(updatedPatient) => {
            if (editPatientData) {
              setPatients((prev) =>
                prev.map((p: any) =>
                  p.patient_id === updatedPatient.patient_id ? updatedPatient : p
                )
              );
            } else {
              setPatients((prev) => [updatedPatient, ...prev]);
            }
            setIsPatientModalOpen(false);
          }}
        />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Hospital, or City"
            className="border border-gray-300 p-3 rounded-lg w-full"
          />
          <select
            value={patientTypeSearchTerm}
            onChange={(e) => setPatientTypeSearchTerm(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full"
          >
            <option value="">Gender</option>
            {["Male", "Female"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchQuery("");
              setPatientTypeSearchTerm("");
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border relative overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold">Patients</h2>
          <select
            className="border border-gray-300 p-2 rounded-lg text-sm"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[1, 5, 10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                Rows Per Page: {num}
              </option>
            ))}
          </select>
        </div>

        <table className="min-w-full table-auto mt-4 text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-4">Name</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Hospital</th>
              <th className="p-4">Consultant</th>
              <th className="p-4">City</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient: any) => (
              <tr key={patient.patient_id} className="border-t">
                <td className="p-4">{patient.name}</td>
                <td className="p-4">{patient.gender}</td>
                <td className="p-4">{patient.hospital.name}</td>
                <td className="p-4">{patient.consultant.name}</td>
                <td className="p-4">{patient.city}</td>
                <td className="p-4">
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => openDeleteModal(patient.patient_id)}
                    >
                      Delete
                    </button>
                    <ConfirmModalVehicle
                      isOpen={isDeleteModalOpen}
                      onClose={closeDeleteModal}
                      onConfirm={confirmDeletePatient}
                      message="Are you sure you want to delete this record?"
                    />
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => handleEdit(patient)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center items-center mt-4">
          <button
            className="rounded-l-md border border-r-0 px-4 py-2 text-sm text-slate-600 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
          >
            &larr;
          </button>

          <div className="flex border border-slate-300">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-4 py-2 text-sm ${
                  page === currentPage
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="rounded-r-md border border-l-0 px-4 py-2 text-sm text-slate-600 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Patientman;