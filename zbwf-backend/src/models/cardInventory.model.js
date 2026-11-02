import { DataTypes, Model, Sequelize } from 'sequelize';
import Hospital from './hospital.model.js'; 

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

class CardInventory extends Model {}

CardInventory.init({
  cards_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cards: DataTypes.INTEGER,
  hospital_id: {
    type: DataTypes.UUID,
    references: {
      model: Hospital,
      key: 'hospital_id',
    },
    allowNull: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  dispatch_date: DataTypes.DATE,
  purpose: DataTypes.STRING,
  split_full: DataTypes.ENUM('Split', 'Full'),
  metabolic_type: DataTypes.ENUM('Metabolic', 'TSH', 'Other'),
  babies_screened: DataTypes.INTEGER,
  wastage: DataTypes.INTEGER,
}, {
  sequelize,
  modelName: 'CardInventory',
  tableName: 'cards_inventory',
  timestamps: true,
});

CardInventory.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

export default CardInventory;
