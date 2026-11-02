import { Sequelize, DataTypes, Model } from 'sequelize';
import Hospital from './hospital.model.js';
import Consultant from './consultants.model.js';
import Test from './test.model.js';

class Patient extends Model {}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

Patient.init(
  {
    patient_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    mother_name: DataTypes.STRING,
    gender: DataTypes.STRING,
    father_guardian_name: DataTypes.STRING,
    hospital_id: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    consultant_id: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    region: DataTypes.STRING,
    city: DataTypes.STRING,
    mobile1: DataTypes.STRING,
    mobile2: DataTypes.STRING,
    landline: DataTypes.STRING,
    email: DataTypes.STRING,
    visit_no: DataTypes.STRING,
    receive_date: DataTypes.DATEONLY,
    collection_date: DataTypes.DATEONLY,
    booking_date: DataTypes.DATEONLY,
    date_of_birth: DataTypes.DATEONLY,
    test_id: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    result_date: DataTypes.DATEONLY,
    status: DataTypes.STRING,
    result_value: DataTypes.FLOAT,
    address: DataTypes.TEXT,
    twins: {
      type: DataTypes.ENUM('Twin', 'Triplet', 'None'),
      defaultValue: 'None',
    },
  },
  {
    sequelize,
    modelName: 'Patient',
    tableName: 'patients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);


Patient.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
Patient.belongsTo(Consultant, { foreignKey: 'consultant_id', as: 'consultant' });
Patient.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

export default Patient;
