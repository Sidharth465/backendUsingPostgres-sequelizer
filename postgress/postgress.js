import { Sequelize } from "sequelize";
import { createUserModel } from "./model/userSchema.js";

const sequelize = new Sequelize(
  "postgresql://postgres:DNNnEpyFPZZvZPDGURtLEvRhIPyCfNXQ@junction.proxy.rlwy.net:52163/railway"
);

let UserModal= null
const connectionToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "Railway Database Connection has been established successfully."
    );
    UserModal = await createUserModel(sequelize)
    await sequelize.sync()
    console.log("Database Synced")
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// Call the function to connect to the database
export {
    connectionToDatabase
}
