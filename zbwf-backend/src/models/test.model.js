import { DataTypes,Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  });

const Test = sequelize.define('Test', {
  test_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  normal_range: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
        sequelize,
  tableName: 'tests',
  timestamps: true,

    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Test;
