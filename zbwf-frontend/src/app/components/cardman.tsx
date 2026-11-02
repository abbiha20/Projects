"use client";

import React, { useState } from "react";
import ConfirmModalVehicle from "./modaldeletevehicle";
import { toast } from "react-toastify";
import CardFormModal from "./addupdatecard";

function Cardman() {
  const dummyCards = [
    {
      id: "1",
      card: "Card A",
      hospital: "Hospital A",
      dispatchDate: "2024-06-01",
      splitFull: "Split",
      type: "Metabolic",
      babiesScreened: 5,
    },
    {
      id: "2",
      card: "Card B",
      hospital: "Hospital B",
      dispatchDate: "2024-06-02",
      splitFull: "Full",
      type: "TSH",
      babiesScreened: 3,
    },
  ];

  const [cards, setCards] = useState(dummyCards);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);


  const filteredCards = cards.filter((card) => {
    const query = searchQuery.toLowerCase();
    return (
      card.card.toLowerCase().includes(query) ||
      card.hospital.toLowerCase().includes(query) ||
      card.splitFull.toLowerCase().includes(query) ||
      card.type.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredCards.length / rowsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const openDeleteModal = (id: string) => {
    setDeleteCardId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteCardId(null);
  };

  const confirmDeleteCard = () => {
    if (!deleteCardId) return;
    setCards((prev) => prev.filter((c) => c.id !== deleteCardId));
    toast.success("Card successfully deleted!");
    closeDeleteModal();
  };

  const handleEdit = (card: any) => {
    alert(`Edit card:\n\n${JSON.stringify(card, null, 2)}`);
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
        <h1 className="text-2xl font-semibold">Card Management</h1>
        <button
        onClick={() => setIsCardModalOpen(true)}
        className="bg-[#191919] text-white px-6 py-3 rounded-lg"
      >
        Add New Card
      </button>
      <CardFormModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Hospital, Split/Full or Type"
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
          <h2 className="text-lg font-semibold">Cards</h2>
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
              <th className="p-4">Card</th>
              <th className="p-4">Hospital</th>
              <th className="p-4">Dispatch Date</th>
              <th className="p-4">Split/Full</th>
              <th className="p-4">Type</th>
              <th className="p-4">Babies Screened</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCards.map((card) => (
              <tr key={card.id} className="border-t">
                <td className="p-4">{card.card}</td>
                <td className="p-4">{card.hospital}</td>
                <td className="p-4">{card.dispatchDate}</td>
                <td className="p-4">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {card.splitFull}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {card.type}
                  </span>
                </td>
                <td className="p-4">{card.babiesScreened}</td>
                <td className="p-4">
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => openDeleteModal(card.id)}
                    >
                      Delete
                    </button>
                    <ConfirmModalVehicle
                      isOpen={isDeleteModalOpen}
                      onClose={closeDeleteModal}
                      onConfirm={confirmDeleteCard}
                      message="Are you sure you want to delete this card?"
                    />
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => handleEdit(card)}
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

export default Cardman;
