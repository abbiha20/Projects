

import { Op } from 'sequelize';
import Test from '../models/test.model.js';

export const getTests = async (req, res) => {
  try {
    const {
      name = '',
      unit = '',
      normal_range = '',
      cost = '',
      page = 1,
      pageSize = 10,
    } = req.query;

    const offset = (page - 1) * pageSize;

    
    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (unit) {
      where.unit = { [Op.like]: `%${unit}%` };
    }

    if (normal_range) {
      where.normal_range = { [Op.like]: `%${normal_range}%` };
    }

    if (cost) {
      where.cost = { [Op.eq]: cost };
    }

    const { rows, count } = await Test.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      tests: rows,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch tests' });
  }
};


export const addTest = async (req, res) => {
  try {
    const { name, unit, normal_range, cost } = req.body;
    const newTest = await Test.create({ name, unit, normal_range, cost });
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message:  error.message || 'Failed to add test' });
  }
};

export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, normal_range, cost } = req.body;
    const test = await Test.findByPk(id);

    if (!test) return res.status(404).json({ message: 'Test not found' });

    await test.update({ name, unit, normal_range, cost });
    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update test' });
  }
};

export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findByPk(id);

    if (!test) return res.status(404).json({ message: 'Test not found' });

    await test.destroy();
    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete test' });
  }
};

export const getSingleTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findByPk(id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch test' });
  }
};
