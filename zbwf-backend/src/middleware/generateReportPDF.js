import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const generatePatientReportPDF = async (patientData) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Inject HTML with patientData
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 40px; }
          h1 { color: #d63384; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>New Born Screening Report</h1>
        <p><strong>Baby Name:</strong> ${patientData.baby_name}</p>
        <p><strong>Gender:</strong> ${patientData.gender}</p>
        <p><strong>Consultant:</strong> ${patientData.consultant}</p>
        <p><strong>Hospital:</strong> ${patientData.hospital}</p>
        <p><strong>Date of Birth:</strong> ${patientData.date_of_birth}</p>
        <p><strong>Test Date:</strong> ${patientData.date}</p>

        <table>
          <tr>
            <th>Test Name</th>
            <th>Patient's Value</th>
            <th>Reference Value</th>
            <th>Unit</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>${patientData.test_name}</td>
            <td>${patientData.patient_value}</td>
            <td>${patientData.reference_value}</td>
            <td>${patientData.unit}</td>
            <td>${patientData.report_status}</td>
          </tr>
        </table>

        <h3>Remarks</h3>
        <p>${patientData.remarks}</p>

        <h3>Comments</h3>
        <p>${patientData.comments}</p>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfPath = path.join('./', 'report.pdf');
  await page.pdf({ path: pdfPath, format: 'A4' });

  await browser.close();

  return pdfPath;
};
