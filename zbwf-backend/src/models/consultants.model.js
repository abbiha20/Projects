import { DataTypes, Model, Sequelize } from 'sequelize';

import Hospital from './hospital.model.js'; 

class Consultant extends Model {}


const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  });

Consultant.init({
  consultant_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING,
  },
  specialization: {
    type: DataTypes.STRING,
  },
  contact: {
    type: DataTypes.STRING,
  },
  landline: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  hospital_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Hospital,
      key: 'hospital_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  sequelize,
  modelName: 'Consultant',
  tableName: 'consultants',
  timestamps: true,
});

Consultant.belongsTo(Hospital, {
  foreignKey: 'hospital_id',
  as: 'hospital',
});

export default Consultant;
