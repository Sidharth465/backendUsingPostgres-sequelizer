import { DataTypes, Sequelize } from "sequelize";

export const createUserModel = async(sequelize) => {
  const User = await sequelize.define("User", {
    empId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isLowercase: true,
      },
      unique: true,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },{timeStamps:true,
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt', 

  });
  return User;
};
