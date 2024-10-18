import { Sequelize } from "sequelize";
import { createOrderModel } from "./model/orderSchema.js";
import { createProductModel } from "./model/productModel.js";
import { createUserModel } from "./model/userSchema.js";


export const sequelize = new Sequelize(
  "postgresql://postgres:DNNnEpyFPZZvZPDGURtLEvRhIPyCfNXQ@junction.proxy.rlwy.net:52163/railway"
);

let UserModel = null;
let OrderModel = null;
let ProductModel = null;

const connectionToDatabase = async () => {

  
  try {
    await sequelize.authenticate();
    console.log(
      "Railway Database Connection has been established successfully."
    );
    UserModel = await createUserModel(sequelize);
    OrderModel = await createOrderModel(sequelize);
    ProductModel = await createProductModel(sequelize);

    
    UserModel.hasMany(OrderModel, {
      foreignKey: "empId",
      as: "orders",
    });
    OrderModel.belongsTo(UserModel, {
      foreignKey: "empId",
      as: "users",
    });


  
    await sequelize.sync();
    console.log("Database Synced");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// Call the function to connect to the database
export { connectionToDatabase, OrderModel, ProductModel, UserModel };


