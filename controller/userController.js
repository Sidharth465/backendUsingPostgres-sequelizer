import { Op, where } from "sequelize";
import createUniqueId from "../constant.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { sequelize, UserModel } from "../postgress/postgress.js";

const validateUser = (user) => {
  const { name, email, designation } = user;
  const errors = [];

  // Check if fields are present
  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Name is required and should be a non-empty string.");
  }
  if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
    errors.push("Valid email is required.");
  }
  if (
    !designation ||
    typeof designation !== "string" ||
    designation.trim() === ""
  ) {
    errors.push("Designation is required and should be a non-empty string.");
  }

  return errors;
};

const userController = {
  showWelcome: async (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Free Employee & Orders API</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #282c34;
                color: #ffffff;
                display: flex;
                flex-direction: column;
                min-height: 100vh; /* Ensure the body takes at least the full height of the viewport */
            }
            .content {
                flex: 1; /* Allow the content to grow and fill the space */
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
            }
            h1 {
                font-size: 2.5em;
                margin-bottom: 20px;
                color: #AD49E1;
                text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
            }
            h2 {
                font-size: 1.8em;
                margin: 20px 0 10px;
                color: #BB86FC;
                border-bottom: 2px solid #BB86FC;
                padding-bottom: 5px;
            }
            p {
                font-size: 1.2em;
                color: #e0e0e0;
                margin-bottom: 20px;
            }
            ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
                width: 100%;
                max-width: 600px;
                text-align: left;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
            }
            li {
                margin: 10px 0;
                padding: 10px;
                border-radius: 5px;
                transition: background 0.3s;
            }
            li:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            footer {
                padding: 10px 0;
                color: #b0b0b0;
                border-top: 1px solid #444;
                width: 100%;
                text-align: center; /* Center the footer text */
            }
            pre {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                padding: 10px;
                margin: 10px 0;
                overflow-x: auto;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="content">
            <h1>Welcome to Our API!</h1>
            <p>This API allows you to manage users and orders with ease.</p>

            <h2>User Management Endpoints</h2>
            <ul>
                <li><strong>GET</strong> /getAll - Get all employees</li>
                <li><strong>POST</strong> /createEmployee - Create a new employee</li>
                <pre>Request Body: { "name": "string", "email": "string", "designation": "string" }</pre>
                <li><strong>GET</strong> /getById/:id - Get a user by ID</li>
                <li><strong>PUT</strong> /update/employee/:id - Update an employee by ID</li>
                <pre>Request Body: { "name": "string", "email": "string" }</pre>
                <li><strong>DELETE</strong> /delete/employee/:id - Delete an employee by ID</li>
            </ul>

            <h2>Order Management Endpoints</h2>
            <ul>
                <li><strong>GET</strong> /orders/:empId - Get orders by employee ID</li>
                <pre>Request Body: { "empId": "string" }</pre>
                <p>Returns the orders associated with the specified employee ID.</p>
            </ul>
        </div>

        <footer>
            <p>&copy; 2024 Siddharth Verma</p>
        </footer>
    </body>
    </html>
    `);
  },




  createUser: async (req, res, next) => {
    let userId = createUniqueId("user");
    const { name, email, designation } = req.body;
    console.log("req.body", { name, email, designation, userId });

    try {
      const user = await UserModel.findOne({ where: { empId: userId } });

      if (user) {
        return next(new AppError("User already exists", 400)); // Handle duplicate user
      } else {
        const newUser = await UserModel.create({
          name,
          email,
          designation,
          empId: userId,
        });
        await newUser.save();
        return res
          .status(201)
          .json({ status: true, message: "User created successfully!" });
      }
    } catch (error) {
      if (error instanceof AppError) {
        return next(error); // Pass operational errors directly
      }
      next(new AppError("Internal server error!", 500)); // For unexpected errors
    }
  },

  createMultipleUser: async (req, res, next) => {
    try {
      const { users } = req.body;
      const validUsers = [];
      const duplicateErrors = [];
      // validate users error
      if (!Array.isArray(users) || users.length === 0) {
        return next(
          new AppError("Invalid input: users array is required", 400)
        );
      }

      // using query   const existingUSers =  await sequelize.query(`SELECT email FROM "Users"`,{type:sequelize.QueryTypes.SELECT})
      // result will be array of object with email

      const existingUsers = await UserModel.findAll({ attribute: ["email"] });
      const existingEmailMap = new Map(
        existingUsers.map((user) => [user.email, true])
      ); //use test.js to see usage

      for (let user of users) {
        const validationErrors = validateUser(user);
        if (validationErrors.length > 0) {
          return next(
            new AppError(
              `Invalid user data: ${validationErrors.join(" ")}`,
              400
            )
          );
        }

        // check for duplicate
        if (existingEmailMap.has(user.email)) {
          duplicateErrors.push(`Email ${user.email} already exists.`);
        } else {
          let userId = createUniqueId("emp");
          validUsers.push({
            name: user.name,
            email: user.email,
            designation: user.designation,
            empId: userId,
          });
        }
      }
      if (duplicateErrors.length === users.length) {
        return next(
          new AppError(`Duplicate entries: ${duplicateErrors.join(" ")}`, 400)
        );
      }
      // create multiple users

      const createdUsers = await UserModel.bulkCreate(validUsers);
      return res.status(201).json({
        status: true,
        message: "Users created successfully!",
        data: createdUsers,
        errorData:
          duplicateErrors.length > 0 ? duplicateErrors.join(", ") : null,
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      }
      next(new AppError("Internal server error!", 500)); // For unexpected errors
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const users = await sequelize.query('SELECT * FROM "Users" WHERE "softDelete"=false', {
        type: sequelize.QueryTypes.SELECT,
      });

      if (!users || users.length === 0) {
        return next(new AppError("No users found", 404)); // Handle not found
      }
      console.log("users", users);

      res.status(200).json({ status: true, data: users });
    } catch (error) {
      console.error("Query error:", error);
      if (error instanceof AppError) {
        return next(error);
      }
      next(new AppError("Internal server error!", 500)); // For unexpected errors
    }
  },
  getUserById: async (req, res, next) => {
    try {
      let userId = req.params.id;
      const user = await sequelize.query(
        `select *from "Users" where "empId" = :userId`,
        {
          replacements: { userId },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      if (!user || user?.length == 0) {
        return next(new AppError("User not found", 404)); // Handle not found
      }
      return res.status(200).json({ status: true, data: user });
    } catch (error) {
      console.error("Query error:", error);
      if (error instanceof AppError) {
        return next(error);
      }
      next(new AppError("Internal server error!", 500)); // For unexpected errors
    }
  },
  updateUser: async (req, res, next) => {
    try {
      const empId = req?.params?.id;
      const { name, email } = req?.body;

      const user = await UserModel.findOne({ where: { empId } });

      if (!user) {
        return next(new AppError("User not found", 404)); // Handle not found
      }
      await sequelize.query(
        `UPDATE "Users"
          SET name = :name,
          email = :email
          WHERE "empId" = :empId`,
        {
          replacements: { name, email, empId },
          type: sequelize.QueryTypes.UPDATE,
        }
      );

      return res.status(200).json({
        status: true, 
        message: "updated user successfully!",
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      }
      next(new AppError("internal server error", 500));
    }
  },


  deleteUser:async(req,res,next)=>{
    try {
      let  empId = req?.params?.id;
      const user =await UserModel.findOne({where:{[Op.and]:[{empId:empId},{softDelete:false}]}})
      if(!user){
        return next(new AppError("User not found", 404)) // Handle not found)
      }
     let deleted =   await  sequelize.query(`UPDATE "Users" SET "softDelete" = true WHERE "empId" = :empId`,{
      replacements:{empId},
      type:sequelize.QueryTypes.UPDATE
     })
     console.log("deleted**",deleted)
     res.status(200).json({ message: "Post deleted successfully." });

    } catch (error) {
      if(error instanceof AppError){
        next(error)
      }
      next(new AppError("internal server error", 500))
      
    }
  }
};

export default userController;
