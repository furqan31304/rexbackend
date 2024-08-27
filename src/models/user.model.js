import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    avatar:{
        type:String, // hum cloundniary use kry gy
        required:true
    },
    coverImage:{
        type:String, // hum cloundniary use kry gy
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    refreshToken:{
        type:String,
    },
    accessToken:{
        type:String,
    }

},{
    timestamps:true
})
userSchema.pre("save",async function(next){
   if(!this.isModified("password")) next();
   this.password=await bcrypt.hash(this.password,8)  // 8 number dia hai jo k rounds hain ---- idher passowrd encrypt ho raha hai
   next()

}) //()=> aisy bilkul


userSchema.methods.isPasswordCorrect= async function(password){
   await bcrypt.compare(password,this.password)

}

userSchema.methods.generateAccessToken=async function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefreshToken=async function(){
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}
export const User=mongoose.model("User",userSchema)