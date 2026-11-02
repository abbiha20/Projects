import { Sequelize, DataTypes, Model } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);


import Patient from './patient.model.js';
import Consultant from './consultants.model.js';
import Test from './test.model.js';
import Hospital from './hospital.model.js';
import Kit from './kit.model.js';


class Report extends Model {}

Report.init(
  {
    report_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    kit_id: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    consultant_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    test_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    patient_value: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    reference_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    report_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    considerations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Report.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Report.belongsTo(Consultant, { foreignKey: 'consultant_id', as: 'consultant' });
Report.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });
Report.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
Report.belongsTo(Kit, { foreignKey: 'kit_id', as: 'kit' });

export default Report;
