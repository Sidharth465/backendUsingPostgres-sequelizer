import express from "express"
import userController from "../controller/userController.js";
import orderController from "../controller/orderController.js";



const router = express.Router();
// user
router.get("/getAll",userController.getAllUsers)
router.post("/createEmployee",userController.createUser)
router.post("/create/users/multiple",userController.createMultipleUser)
router.get("/getById/:id",userController.getUserById)
router.put("/update/user/:id",userController.updateUser)
router.delete("/delete/user/:id",userController.deleteUser)

// orders
router.get('/orders/:empId',orderController.getOrdersByEmployee );



export default router;