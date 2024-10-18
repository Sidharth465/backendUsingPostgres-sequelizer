import { DataTypes } from "sequelize";

export const createOrderModel = async (sequelize) => {
  const Order = await sequelize.define("Order", {
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    empId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Users",
        key: "empId",
      },
    },
    productList: {
      type: DataTypes.JSONB, // Changed to JSON for flexibility
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0, // Ensures totalAmount is non-negative
      },
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled'),
      defaultValue: 'Pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  

  return Order;
};
