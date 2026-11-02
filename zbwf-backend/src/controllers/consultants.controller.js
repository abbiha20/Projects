import  Consultant  from '../models/consultants.model.js';
import   Hospital  from '../models/hospital.model.js';
import { Op } from 'sequelize';

export const addConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.create(req.body);
    res.status(201).json({ message: 'Consultant added successfully', consultant });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add consultant' });
  }
};

export const getConsultants = async (req, res) => {
  try {
    const { search = '', page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { designation: { [Op.like]: `%${search}%` } },
        { specialization: { [Op.like]: `%${search}%` } }
      ]
    };

    const consultants = await Consultant.findAndCountAll({
      where,
      attributes: {
        exclude: ['hospital_id'], 
      },
      include: [{
        model: Hospital,
        as: 'hospital',
        required: false,
        attributes: ['hospital_id', 'name'], 
      }],
      offset,
      limit: parseInt(pageSize),
    });

    res.status(200).json({
      consultants: consultants.rows,
      totalConsultants: consultants.count,
      currentPage: Number(page),
      totalPages: Math.ceil(consultants.count / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch consultants' });
  }
};

export const getConsultantById = async (req, res) => {
  try {
    const consultant = await Consultant.findByPk(req.params.id, {
      attributes: {
        exclude: ['hospital_id'], 
      },
      include: [
        
        {
          model: Hospital,
          as: 'hospital',
          required: false,
          attributes: ['hospital_id', 'name'],
        },
      ],
    });

    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    res.status(200).json(consultant);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching consultant' });
  }
};

export const updateConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.findByPk(req.params.id);
    if (!consultant) return res.status(404).json({ message: 'Consultant not found' });

    await consultant.update(req.body);
    res.status(200).json({ message: 'Consultant updated', consultant });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating consultant' });
  }
};

export const deleteConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.findByPk(req.params.id);
    if (!consultant) return res.status(404).json({ message: 'Consultant not found' });

    await consultant.destroy();
    res.status(200).json({ message: 'Consultant deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting consultant' });
  }
};


export const getConsultantsDropdown = async (req, res) => {
  try {
    console.log('Fetching consultants...');
    const consultants = await Consultant.findAll({
      attributes: ['consultant_id', 'name'], 
      order: [['name', 'ASC']],
    });
    console.log('Consultants found:', consultants);

    if (!consultants || consultants.length === 0) {
      return res.status(404).json({ message: 'No consultants found' });
    }

    res.status(200).json(consultants);
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({ message: error.message || 'Error fetching consultants' });
  }
};
