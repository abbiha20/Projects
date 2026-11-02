/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import ConfirmModalVehicle from "./modaldeletevehicle";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import NewbornReport from "./newbornreport";
import { useRef } from "react";
import ReportFormModal from "./addupdatereport";

function Reportman() {
  const dummyReports = [
    {
      id: "P001",
      name: "John Doe",
      gender: "Male",
      mobile: "1234567890",
      origin: "Hospital A",
      consultant: "Dr. Smith",
      test: "TSH",
      result: "2.5",
      kit: "Kit A",
      lotNumber: "LOT123",
    },
    {
      id: "P002",
      name: "Jane Roe",
      gender: "Female",
      mobile: "0987654321",
      origin: "Clinic B",
      consultant: "Dr. Brown",
      test: "PKU",
      result: "Normal",
      kit: "Kit B",
      lotNumber: "LOT456",
    },
  ];

  const [reports, setReports] = useState(dummyReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase();
    return (
      report.name.toLowerCase().includes(query) ||
      report.id.toLowerCase().includes(query) ||
      report.origin.toLowerCase().includes(query) ||
      report.test.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const openDeleteModal = (id: string) => {
    setDeleteReportId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteReportId(null);
  };

  const confirmDelete = () => {
    if (!deleteReportId) return;
    setReports((prev) => prev.filter((r) => r.id !== deleteReportId));
    toast.success("Report successfully deleted!");
    closeDeleteModal();
  };

  const handleEdit = (report: any) => {
    alert(`Edit report:\n\n${JSON.stringify(report, null, 2)}`);
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

  const reportRef = useRef();

  const handleExportPDF = () => {
    if (!reportRef.current) {
      alert("Report not found");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: "newborn_screening_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(reportRef.current).save();
  };

  return (
    <div className="p-4 md:p-8 w-full bg-gray-100 text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Report Management</h1>
        <button
        onClick={() => setIsReportModalOpen(true)}
        className="bg-[#191919] text-white px-6 py-3 rounded-lg"
      >
        Add New Report
      </button>
      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, ID, Origin, or Test"
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
          <h2 className="text-lg font-semibold">Reports</h2>
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
              <th className="p-4">Patient ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Sample Origin</th>
              <th className="p-4">Consultant</th>
              <th className="p-4">Test</th>
              <th className="p-4">Result</th>
              <th className="p-4">Kit</th>
              <th className="p-4">Lot Number</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.map((report) => (
              <tr key={report.id} className="border-t">
                <td className="p-4">{report.id}</td>
                <td className="p-4">{report.name}</td>
                <td className="p-4">{report.gender}</td>
                <td className="p-4">{report.mobile}</td>
                <td className="p-4">{report.origin}</td>
                <td className="p-4">{report.consultant}</td>
                <td className="p-4">{report.test}</td>
                <td className="p-4">{report.result}</td>
                <td className="p-4">{report.kit}</td>
                <td className="p-4">{report.lotNumber}</td>
                <td className="p-4">
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => openDeleteModal(report.id)}
                    >
                      Delete
                    </button>
                    <ConfirmModalVehicle
                      isOpen={isDeleteModalOpen}
                      onClose={closeDeleteModal}
                      onConfirm={confirmDelete}
                      message="Are you sure you want to delete this report?"
                    />
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => handleEdit(report)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                      onClick={handleExportPDF}
                    >
                      Export as PDF
                    </button>

                    {/* Hidden but mounted in DOM */}
                    <div style={{ display: "none" }}>
                      <div ref={reportRef}>
                        <NewbornReport />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination logic remains unchanged */}
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

export default Reportman;
