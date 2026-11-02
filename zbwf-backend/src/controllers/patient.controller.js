import Patient from '../models/patient.model.js';
import { Op } from 'sequelize';

import Hospital from '../models/hospital.model.js';
import Consultant from '../models/consultants.model.js';
import Test from '../models/test.model.js';

export const addPatient = async (req, res) => {
  try {
    const newPatient = await Patient.create(req.body);
    res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};


export const updatePatient = async (req, res) => {
  try {
    const { patient_id } = req.params; 
    const updatedPatient = await Patient.update(req.body, {
      where: { patient_id },
      returning: true, 
    });

    if (updatedPatient[0] === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient[1][0] });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const deletedPatient = await Patient.destroy({
      where: { patient_id },
    });

    if (deletedPatient === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({  message: error.message || 'Internal Server Error' });
  }
};




export const getPatients = async (req, res) => {
  try {
    const {
      pageNumber = 1,
      pageSize = 10,
      name,
      mother_name,
      gender,
      father_guardian_name,
    hospital_name,
    consultant_name,
    test_name,
      region,
      city,
      mobile1,
      mobile2,
      landline,
      email,
      visit_no,
      receive_date,
      collection_date,
      booking_date,
      date_of_birth,
      
      result_date,
      status,
      result_value,
      address,
      twins,
    } = req.query;

    const page = parseInt(pageNumber, 10) || 1;
    const size = parseInt(pageSize, 10) || 10;

    const filterConditions = {};

    if (name) filterConditions.name = { [Op.like]: `%${name}%` };
    if (mother_name) filterConditions.mother_name = { [Op.like]: `%${mother_name}%` };
    if (gender) filterConditions.gender = { [Op.like]: `%${gender}%` };
    if (father_guardian_name) filterConditions.father_guardian_name = { [Op.like]: `%${father_guardian_name}%` };
    if (region) filterConditions.region = { [Op.like]: `%${region}%` };
    if (city) filterConditions.city = { [Op.like]: `%${city}%` };
    if (mobile1) filterConditions.mobile1 = { [Op.like]: `%${mobile1}%` };
    if (mobile2) filterConditions.mobile2 = { [Op.like]: `%${mobile2}%` };
    if (landline) filterConditions.landline = { [Op.like]: `%${landline}%` };
    if (email) filterConditions.email = { [Op.like]: `%${email}%` };
    if (visit_no) filterConditions.visit_no = { [Op.like]: `%${visit_no}%` };
    if (receive_date) filterConditions.receive_date = { [Op.eq]: receive_date };
    if (collection_date) filterConditions.collection_date = { [Op.eq]: collection_date };
    if (booking_date) filterConditions.booking_date = { [Op.eq]: booking_date };
    if (date_of_birth) filterConditions.date_of_birth = { [Op.eq]: date_of_birth };
    if (result_date) filterConditions.result_date = { [Op.eq]: result_date };
    if (status) filterConditions.status = { [Op.like]: `%${status}%` };
    if (result_value) filterConditions.result_value = { [Op.eq]: result_value };
    if (address) filterConditions.address = { [Op.like]: `%${address}%` };
    if (twins) filterConditions.twins = { [Op.eq]: twins };

    // Include related tables with selected fields (only name from related tables)
  const include = [
      {
        model: Hospital,
        as: 'hospital',
        attributes: ['hospital_id', 'name'],  
        required: false,
        where: hospital_name ? { name: { [Op.like]: `%${hospital_name}%` } } : {},
      },
      {
        model: Consultant,
        as: 'consultant',
        attributes: ['consultant_id', 'name'],  
        required: false,
        where: consultant_name ? { name: { [Op.like]: `%${consultant_name}%` } } : {},
      },
      {
        model: Test,
        as: 'test',
        attributes: ['test_id', 'name'],  
        required: false,
        where: test_name ? { name: { [Op.like]: `%${test_name}%` } } : {},
      }
    ];

    // Pagination
    const offset = (page - 1) * size;
    const limit = size;

    const patients = await Patient.findAll({
      where: filterConditions,
      limit,
      offset,
      include,
      attributes: { exclude: ['hospital_id', 'consultant_id', 'test_id'] }  
    });

    const totalPatients = await Patient.count({ where: filterConditions });

    res.status(200).json({
      patients,
      totalPages: Math.ceil(totalPatients / size),
      currentPage: page,
      totalPatients,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
       include :[
      {
        model: Hospital,
        as: 'hospital',
        required: false,
        attributes: ['hospital_id', 'name'],  // Only select id and name from Hospital
       
      },
      {
        model: Consultant,
        as: 'consultant',
        required: false,
        attributes: ['consultant_id', 'name'],  // Only select id and name from Consultant
       
      },
      {
        model: Test,
        as: 'test',
        required: false,
        attributes: ['test_id', 'name'],  // Only select id and name from Test
       }
    ],

      attributes: { exclude: ['hospital_id', 'consultant_id', 'test_id'] }  // Exclude IDs from Patient table
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
