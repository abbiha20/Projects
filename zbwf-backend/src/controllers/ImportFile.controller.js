import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import Patient from '../models/patient.model.js';

export const importPatientsFromExcel = async (req, res) => {
  try {
    const filePath = req.file.path;


    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; 
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet); 

    const patientsToCreate = rows.map((row) => ({
        name: row['name'] || null,
        gender: row['gender'] || null,
        mother_name: row['mother name'] || null,
        mobile1: row['mobile no']?.toString() || null,
        date_of_birth: row['date of birth'] || null,
        hospital: row['hospital name'] || null,
        city: row['city_name'] || null,
        doctor: row['consultant'] || null,
        test: row['test'] || null,
        collection_date: row['collection date'] || null,
        result_date: row['result date'] || null,
        result_value: parseFloat(row['result value']) || null,
        status: row['result status'] || null,
      
       
        father_guardian_name:  row['father/guardian name'] || null,
        region:  row['region'] || null,
        mobile2:  row['mobile2'] || null,
        landline:  row['landline'] || nullll,
        email:  row['email'] || null,
        visit_no:  row['visit no'] || null,
        receive_date:  row['receive date'] || null,
        booking_date:  row['booking date'] || null,
        address:  row['address'] || null,
        twins:  row['twins'] || null,
      }));
      


    await Patient.bulkCreate(patientsToCreate);


    fs.unlinkSync(filePath);

    res.status(201).json({ message: 'Patients imported successfully', count: patientsToCreate.length });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message || 'Failed to import patients' });
  }
};
