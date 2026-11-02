import { DataTypes, Model,Sequelize } from 'sequelize';


class Hospital extends Model {}




const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  });
Hospital.init({
  hospital_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
  mapUrl: { type: DataTypes.STRING },
  officialEmail: { type: DataTypes.STRING },
  region: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  contact: { type: DataTypes.STRING },
  contactPerson: { type: DataTypes.STRING }
}, {
  sequelize,
  modelName: 'Hospital',
  tableName: 'hospitals',
  timestamps: true,
});

export default Hospital;
