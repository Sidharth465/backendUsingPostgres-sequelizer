import express from "express";
import { connectionToDatabase } from "./postgress/postgress.js";
import router from "./view/routes.js";

const app = express()
app.use(router)

app.listen(8000,()=>{
  console.log("Server is connected on port 8000");
  
})
connectionToDatabase();
