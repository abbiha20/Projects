import { DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

class User extends Model {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  generateAccessToken() {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        username: this.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_SECRET_EXPIRY }
    );
  }

  generateRefreshToken() {
    return jwt.sign(
      { id: this.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    status: {
      type: DataTypes.ENUM('enabled', 'disabled'),
      allowNull: false,
      defaultValue: 'enabled',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await User.hashPassword(user.password);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await User.hashPassword(user.password);
        }
      },
    },
  }
);

export default User;
