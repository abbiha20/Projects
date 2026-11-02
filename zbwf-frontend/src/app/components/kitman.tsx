"use client";

import React, { useState } from "react";
import ConfirmModalVehicle from "./modaldeletevehicle";
import { toast } from "react-toastify";
import KitFormModal from "./addupdatekit";

function Kitman() {
  const dummyKits = [
    {
      id: "1",
      lotNumber: "LOT-001",
      kitNumber: "KIT-001",
      receivingDate: "2024-06-01",
      openingDate: "2024-06-02",
      closingDate: "2024-06-10",
      days: 8,
      babiesScreened: 120,
      wastage: 5,
    },
    {
      id: "2",
      lotNumber: "LOT-002",
      kitNumber: "KIT-002",
      receivingDate: "2024-06-05",
      openingDate: "2024-06-06",
      closingDate: "2024-06-12",
      days: 6,
      babiesScreened: 100,
      wastage: 3,
    },
  ];

  const [kits, setKits] = useState(dummyKits);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteKitId, setDeleteKitId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);

  const filteredKits = kits.filter((kit) => {
    const query = searchQuery.toLowerCase();
    return (
      kit.lotNumber.toLowerCase().includes(query) ||
      kit.kitNumber.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredKits.length / rowsPerPage);
  const paginatedKits = filteredKits.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const openDeleteModal = (id: string) => {
    setDeleteKitId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteKitId(null);
  };

  const confirmDeleteKit = () => {
    if (!deleteKitId) return;
    setKits((prev) => prev.filter((k) => k.id !== deleteKitId));
    toast.success("Kit successfully deleted!");
    closeDeleteModal();
  };

  const handleEdit = (kit: any) => {
    alert(`Edit kit:\n\n${JSON.stringify(kit, null, 2)}`);
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
        <h1 className="text-2xl font-semibold">Kits Management</h1>
        <button
        onClick={() => setIsKitModalOpen(true)}
        className="bg-[#191919] text-white px-6 py-3 rounded-lg"
      >
        Add New Kit
      </button>
      <KitFormModal
        isOpen={isKitModalOpen}
        onClose={() => setIsKitModalOpen(false)}
      />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Lot Number or Kit Number"
            className="border border-gray-300 p-3 rounded-lg w-full"
          />
          <button
            onClick={() => setSearchQuery("")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border relative overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold">Kits</h2>
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
              <th className="p-4">Lot Number</th>
              <th className="p-4">Kit Number</th>
              <th className="p-4">Receiving Date</th>
              <th className="p-4">Opening Date</th>
              <th className="p-4">Closing Date</th>
              <th className="p-4">Days</th>
              <th className="p-4">Babies Screened</th>
              <th className="p-4">Wastage</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedKits.map((kit) => (
              <tr key={kit.id} className="border-t">
                <td className="p-4">{kit.lotNumber}</td>
                <td className="p-4">{kit.kitNumber}</td>
                <td className="p-4">{kit.receivingDate}</td>
                <td className="p-4">{kit.openingDate}</td>
                <td className="p-4">{kit.closingDate}</td>
                <td className="p-4">{kit.days}</td>
                <td className="p-4">{kit.babiesScreened}</td>
                <td className="p-4">{kit.wastage}</td>
                <td className="p-4">
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => openDeleteModal(kit.id)}
                    >
                      Delete
                    </button>
                    <ConfirmModalVehicle
                      isOpen={isDeleteModalOpen}
                      onClose={closeDeleteModal}
                      onConfirm={confirmDeleteKit}
                      message="Are you sure you want to delete this kit?"
                    />
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => handleEdit(kit)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination remains unchanged */}
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

export default Kitman;
