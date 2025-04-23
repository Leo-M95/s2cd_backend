import express from "express"
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import jwtGenerator from "./controllers/jwtGenerator.js";
import foodRoute from "./routes/foodRoute.js";




const app= express();

mongoose.connect("mongodb+srv://Admin:SC2d2025@cluster0.mvaguj6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").
then(()=>{
   console.log("Connected to the database") 
}).catch(()=>{
    console.log("Database connection failed")
})

app.use(bodyParser.json())
app.use(jwtGenerator)

app.use("/user",userRoute)
app.use("/food",foodRoute)


app.listen(5000,()=>{
    console.log("Server connected on port 5000")
})