"use client";
import React, { useRef } from "react";
import Image from "next/image";
import html2pdf from "html2pdf.js";

function NewbornReport() {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;

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
    <div ref={reportRef}>
      <div id="report-section" className="bg-white p-8 max-w-4xl mx-auto border border-gray-300 shadow-md text-sm font-sans text-black">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
          <Image
            src="/images/LogoReport.png"
            alt="Dashboard Icon"
            width={150}
            height={150}
            className="h-16"
          />
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold bg-gray-200">
              NEW BORN SCREENING REPORT
            </h2>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-6">
          <h3 className="font-bold text-base mb-2">THE ZB FOUNDATION</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <strong>Baby Name:</strong> Izhaan
            </div>
            <div>
              <strong>Date:</strong> 29-02-2020
            </div>
            <div>
              <strong>Consultant:</strong> Dr. Ali Raza
            </div>
            <div>
              <strong>Gender:</strong> Male
            </div>
            <div>
              <strong>Reference ID:</strong> In5e59fsd1
            </div>
            <div>
              <strong>Hospital:</strong> IHS CH. ISB
            </div>
            <div>
              <strong>Date of Birth:</strong> 19-02-2020
            </div>
          </div>
        </div>

        {/* Result Table */}
        <div className="mb-6">
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-pink-500 text-white">
                <th className="p-2 border">Reference ID</th>
                <th className="p-2 border">Test Name</th>
                <th className="p-2 border">Patient's Value</th>
                <th className="p-2 border">Reference Value</th>
                <th className="p-2 border">Unit</th>
                <th className="p-2 border">Report Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-100">
                <td className="p-2 border">01</td>
                <td className="p-2 border">TSH</td>
                <td className="p-2 border">5.24</td>
                <td className="p-2 border">9M Uum</td>
                <td className="p-2 border">uU/mL</td>
                <td className="p-2 border">Negative</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks */}
        <div className="mb-4">
          <strong>Remarks:</strong>
          <p className="mt-1 bg-gray-100">
            TSH level tested for this sample is within the normal range.
          </p>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <strong>Comments/Conclusion:</strong>
          <p className="mt-1 bg-gray-100">01</p>
        </div>

        {/* Considerations */}
        <div className="mb-6">
          <strong className="block mb-2 bg-gray-100">CONSIDERATIONS</strong>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Results from specimens obtained within the first 24 hours of life
              occasionally are falsely positive for primary hypothyroidism.
            </li>
            <li>
              The main purpose of the repeat sample is to recheck the baby's TSH
              level due to possible masking by transfusion or prematurity.
            </li>
            <li>Birth weight 1000g – repeat sample no later than 6 weeks.</li>
            <li>
              Birth weight 1000g-1499g – repeat sample no later than 4 weeks.
            </li>
            <li>This is a screening test not a diagnostic test.</li>
            <li>
              Infants with primary hypothyroidism should immediately have a
              confirmatory serum test.
            </li>
            <li>
              Use age-appropriate normative values. For 2–6 weeks, the reference
              range is 17 to 9.1 mU/L.
            </li>
          </ul>
        </div>

        {/* Footer Info */}
        <div className="border-t pt-4 text-sm text-gray-700">
          <div className="bg-gray-100 p-4 mb-4">
            <p className="mb-2">
              The Zahra Beau Naqvi Foundation Welfare Trust, an NGO, aims to
              introduce, implement and propagate Newborn Screening program in
              Pakistan, considering it as a birthright of every baby born in
              Pakistan.
            </p>
            <strong>
              Screening for new borns [Saving babies heel by heel]
            </strong>
          </div>

          <div className="w-full mt-8">
            {/* Pink Sidebars with Centered Contact Info */}
            <div className="flex items-center justify-between bg-white px-4 py-2">
              {/* Left Pink Block */}
              <div className="bg-pink-400 w-20 h-10" />

              {/* Centered Contact Info */}
              <div className="flex flex-col items-center text-center text-sm text-black">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">+92 311 5231554</span>
                  <span className="text-blue-700 underline">
                    www.thezbfoundation.com
                  </span>
                </div>
                <div className="text-xs">
                  The ZB Foundation, Islamabad Pakistan, | Reg #314 Government
                  of Pakistan
                </div>
              </div>

              {/* Right Pink Block */}
              <div className="bg-pink-400 w-20 h-10" />
            </div>

            {/* Gray Footer Message with Download Button */}
            <div className="px-4 py-2 mt-1 flex items-center justify-between">
              {/* Download Button */}
              {/* 
              <button
                onClick={handleDownloadPDF}
                className="bg-pink-500 text-white px-4 py-1 rounded hover:bg-pink-600 text-sm"
              >
                Download PDF
              </button> 
              */}

              {/* Report Notice */}
              <p className="text-sm text-black bg-gray-200">
                Electronically generated report. No signature(s) required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewbornReport;
