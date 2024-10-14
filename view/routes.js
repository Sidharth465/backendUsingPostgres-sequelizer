import express from "express"


const router = express.Router();

router.get("/getAll",(req,res)=>{
    res.send("get all")
    console.log("get all");
})





export default router;