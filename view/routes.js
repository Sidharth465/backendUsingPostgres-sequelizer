import express from "express"
import userController from "../controller/userController.js";
import orderController from "../controller/orderController.js";



const router = express.Router();
// user
router.get("/",userController.showWelcome)
router.get("/getAll",userController.getAllUsers)
router.post("/createEmployee",userController.createUser)
router.post("/create/employee/multiple",userController.createMultipleUser)
router.get("/getById/:id",userController.getUserById)
router.put("/update/employee/:id",userController.updateUser)
router.delete("/delete/employee/:id",userController.deleteUser)

// orders
router.get('/orders/:empId',orderController.getOrdersByEmployee );



export default router;