// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express"
// const app=express();
// (async()=>{
//     try{
//        await mongoose.connect(`${proccess.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",()=>{
//         console.log("Error: ",error)
//        })
//        app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on ${process.env.PORT}`)
//        })
//     }catch(error){
//         console.error("Error: ",error)
//         throw error
//     }
// })()


// require('dotenv').config({path:'./env'}) asy pr work kry ga lakin hm import kry gy
import connectDB from "./db/index.js";
import dotenv from "dotenv" ;
dotenv.config({
    path:'./env'
})

connectDB ();