import express from "express";
import { connectionToDatabase } from "./postgress/postgress.js";
import router from "./view/routes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import cors from "cors";



const app = express();
app.use(express.json());
app.use(cors());
app.use(router);
app.use(errorMiddleware);

app.listen(8000, () => {
  console.log("Server is connected on port 8000");
});
connectionToDatabase();
