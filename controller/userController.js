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
            /* Global styles */
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding-horizontal: 20px;
                background-color: #121212; 
                color: #ffffff; 
                display: flex; /* Use flexbox for centering */
                flex-direction: column; /* Stack items vertically */
                align-items: center; /* Center items horizontally */
                justify-content: center; /* Center items vertically */
                height: 100vh; /* Full viewport height */
            }

            /* Heading styles */
            h1 {
                color: #AD49E1; /* Accent color for the main title */
                text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7); /* Elevated shadow */
            }
            h2 {
                color: #AD49E1; /* Accent color for subheadings */
                text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5); /* Elevated shadow for h2 */
            }

            /* Paragraph styles */
            p {
                font-size: 1.2em; /* Increased font size for readability */
                color: #e0e0e0; /* Lighter text for paragraphs */
                text-align: center; /* Center text in paragraphs */
            }

            /* Link styles */
            a {
                color: #bb86fc; /* Light purple link color */
                text-decoration: none; /* Remove underline from links */
            }
            a:hover {
                text-decoration: underline; /* Underline on hover for better UX */
            }

            /* List styles */
            ul {
                list-style-type: none; /* Remove default list styles */
                padding: 0; /* Remove padding */
                text-align: center; /* Center align list items */
            }
            li {
                margin: 8px 0; /* Add some space between list items */
                color: #00BFFF; /* Glittery blue color */
                font-weight: bold; /* Bold text for visibility */
                text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); /* Subtle shadow for depth */
            }

            /* Footer styles */
            footer {
                margin-top: 20px; /* Space above footer */
                padding: 10px 0; /* Padding inside footer */
                text-align: center; /* Center align text */
                color: #b0b0b0; /* Lighter text color for footer */
                border-top: 1px solid #444; /* Top border for separation */
            }
        </style>
    </head>
    <body>
        <h1>Welcome to Our API!</h1>
        <p>This is a simple API that allows you to manage users and orders.</p>

        <h2>Available Endpoints</h2>
        <ul>
            <li><strong>GET</strong> /getAll - Get all employees</li>
            <li><strong>POST</strong> /createEmployee - Create a new employee</li>
            <li><strong>GET</strong> /getById/:id - Get a user by ID</li>
            <li><strong>PUT</strong> /update/employee/:id - Update an employee by ID</li>
            <li><strong>DELETE</strong> /delete/employee/:id - Delete an employee by ID</li>
            <li><strong>GET</strong> /orders/:empId - Get orders by employee ID</li>
        </ul>
        <p>For more information, please refer to the API documentation.</p>

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
