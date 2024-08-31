import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT=asyncHandler(async(request,_,next)=>{
 try {
    console.log(request.cookies?.accessToken);
       const token= request.cookies?.accessToken || request.header("Authorization")?.replace("Bearer","")
       console.log("Token in middleware",token)
       if(!token){
           throw new ApiError(401,"Unauthorized request")
       }
      const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
       throw new ApiError(401,"Invalid Access Token")
     }
   
     request.user=user;
     next()
 } catch (error) {
    throw new ApiError(401,error?.message || " Invalid Access Token")
    
 }
})