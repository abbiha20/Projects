"use client";

import React, { useState } from "react";
import ConfirmModalVehicle from "./modaldeletevehicle";
import { toast } from "react-toastify";
import ConsultantFormModal from "./addupdateconsultant";

function Consultantman() {
  const dummyConsultants = [
    {
      id: "1",
      name: "Dr. Ayesha Khan",
      specialization: "Pediatrics",
      designation: "Senior Consultant",
      hospital: "City Hospital",
      contact: "1234567890",
    },
    {
      id: "2",
      name: "Dr. Ahmed Raza",
      specialization: "Endocrinology",
      designation: "Associate Consultant",
      hospital: "Metro Hospital",
      contact: "0987654321",
    },
  ];

  const [consultants, setConsultants] = useState(dummyConsultants);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConsultantId, setDeleteConsultantId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);

  const filteredConsultants = consultants.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.specialization.toLowerCase().includes(query) ||
      c.hospital.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredConsultants.length / rowsPerPage);
  const paginatedConsultants = filteredConsultants.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const openDeleteModal = (id: string) => {
    setDeleteConsultantId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConsultantId(null);
  };

  const confirmDeleteConsultant = () => {
    if (!deleteConsultantId) return;
    setConsultants((prev) =>
      prev.filter((c) => c.id !== deleteConsultantId)
    );
    toast.success("Consultant successfully deleted!");
    closeDeleteModal();
  };

  const handleEdit = (consultant: any) => {
    alert(`Edit consultant:\n\n${JSON.stringify(consultant, null, 2)}`);
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
        <h1 className="text-2xl font-semibold">Consultant Management</h1>
        <button
        onClick={() => setIsConsultantModalOpen(true)}
        className="bg-[#191919] text-white px-6 py-3 rounded-lg"
      >
        Add New Consultant
      </button>
      <ConsultantFormModal
        isOpen={isConsultantModalOpen}
        onClose={() => setIsConsultantModalOpen(false)}
      />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Specialization, or Hospital"
            className="border border-gray-300 p-3 rounded-lg w-full"
          />
          <button
            onClick={() => {
              setSearchQuery("");
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border relative overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold">Consultants</h2>
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
              <th className="p-4">Specialization</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Hospital</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedConsultants.map((consultant: any) => (
              <tr key={consultant.id} className="border-t">
                <td className="p-4">{consultant.name}</td>
                <td className="p-4">{consultant.specialization}</td>
                <td className="p-4">{consultant.designation}</td>
                <td className="p-4">{consultant.hospital}</td>
                <td className="p-4">{consultant.contact}</td>
                <td className="p-4">
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => openDeleteModal(consultant.id)}
                    >
                      Delete
                    </button>
                    <ConfirmModalVehicle
                      isOpen={isDeleteModalOpen}
                      onClose={closeDeleteModal}
                      onConfirm={confirmDeleteConsultant}
                      message="Are you sure you want to delete this record?"
                    />
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => handleEdit(consultant)}
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
            <button
              className={`px-4 py-2 text-sm ${
                currentPage === 1
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>

            {currentPage > 4 && (
              <span className="px-4 py-2 text-sm text-slate-600">...</span>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page !== 1 &&
                  page !== totalPages &&
                  Math.abs(page - currentPage) <= 2
              )
              .map((page) => (
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

            {currentPage < totalPages - 3 && (
              <span className="px-4 py-2 text-sm text-slate-600">...</span>
            )}

            {totalPages > 1 && currentPage < totalPages && (
              <button
                className={`px-4 py-2 text-sm ${
                  currentPage === totalPages
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            )}
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

export default Consultantman;
