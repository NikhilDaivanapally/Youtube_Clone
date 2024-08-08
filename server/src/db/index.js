import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

console.log(process.env.MONOGO_URI)
const connectDB = async () =>{
    try{
     const connection =  await mongoose.connect(`${process.env.MONOGO_URI}/${DB_NAME}`);
     console.log(`\n MongoDB Connected !! DB HOST : ${connection.connection.host}`)
    }catch(error){
        console.error('MONGODB connection error',error)
        process.exit(1) 
    }
}
export default connectDB;