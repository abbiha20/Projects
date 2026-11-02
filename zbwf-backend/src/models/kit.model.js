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

class Kit extends Model {}

Kit.init(
  {
    kit_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lot_number: DataTypes.STRING,
    kit_number: DataTypes.STRING,
    receiving_date: DataTypes.DATEONLY,
    number_of_kits : DataTypes.INTEGER,
    opening_date: DataTypes.DATEONLY,
    closing_date: DataTypes.DATEONLY,
    expiry_date: DataTypes.DATEONLY,
    babies_screened: DataTypes.INTEGER,
    wastage: DataTypes.INTEGER,
  },
  {
    sequelize,
    modelName: 'Kit',
    tableName: 'kits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Kit;
