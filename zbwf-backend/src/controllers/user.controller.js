import User from '../models/user.model.js'; 
import { Op } from "sequelize";

export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      await user.update(req.body);
  
      const userData = user.get({ plain: true });
      delete userData.password;
  
      res.status(200).json({ message: "User updated successfully", user: userData });
    } catch (error) {
      res.status(500).json({ message: error.message || "Error updating user" });
    }
  };
  

  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      await user.destroy();
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Error deleting user" });
    }
  };



  export const getUsers = async (req, res) => {
    try {
      const { search = '', page = 1, pageSize = 10 } = req.query;
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);
  
      const whereCondition = {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { role: { [Op.like]: `%${search}%` } },
        ],
      };
  
      const users = await User.findAll({
        where: whereCondition,
        offset,
        limit,
        attributes: { exclude: ['password'] }, // 👈 Exclude password here
      });
  
      const totalUsers = await User.count({ where: whereCondition });
  
      res.status(200).json({
        users,
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / pageSize),
        totalUsers,
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Error fetching users" });
    }
  };
  