import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Data Base is connected with Instance:${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGO DB Connection Error",error)
        process.exit(1);
        
    }

}

export default connectDB;