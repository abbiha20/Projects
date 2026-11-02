import Hospital from '../models/hospital.model.js';
import { Op } from 'sequelize';

export const createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ message: 'Hospital created', hospital });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating hospital' });
  }
};

export const getHospitals = async (req, res) => {
  try {
    const { search = '', page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { region: { [Op.like]: `%${search}%` } },
        { officialEmail: { [Op.like]: `%${search}%` } },
      ]
    };

    const hospitals = await Hospital.findAll({ where: whereCondition, offset, limit });
    const total = await Hospital.count({ where: whereCondition });

    res.status(200).json({
      hospitals,
      currentPage: Number(page),
      totalPages: Math.ceil(total / pageSize),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching hospitals' });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching hospital' });
  }
};

export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    await hospital.update(req.body);
    res.status(200).json({ message: 'Hospital updated', hospital });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating hospital' });
  }
};

export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    await hospital.destroy();
    res.status(200).json({ message: 'Hospital deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting hospital' });
  }
};


export const getHospitalsDropdown = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      attributes: ['hospital_id', 'name'],
      order: [['name', 'ASC']],
    });

    if (hospitals.length === 0) {
      return res.status(404).json({ message: 'No hospitals found' });
    }

    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching hospitals' });
  }
};