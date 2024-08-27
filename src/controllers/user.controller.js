import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser=asyncHandler(async(request,response)=>{
    // res.status(200).json({
    //     message:"ok"
    // })

    // get user details from front-end
    // validations on data (not-empty)
    // check if user already exist :username, email
    // check for images, check for avatar
    // upload images to cloudinary, avatar
    // create user object
    // create entry in db
    // remove password & refresh token field from response
    // check for user creation
    // return response


   const {fullName,email, username,password}= request.body
   console.log("email is : " ,email)
   if(fullName===""){
    throw new ApiError (400,"fullname is required")
   }
   if(email===""){
    throw new ApiError (400,"email is required")
   }
   if(username===""){
    throw new ApiError (400,"username is required")
   }
   if(password===""){
    throw new ApiError (400,"password is required")
   }
   if(email!==""||username!==""){
    const existedUser= User.findOne({
        $or:[{email},{username}]
       })
       if(existedUser){
        throw new ApiError(409,"User already Exit")
       }
   }

   const avatarLocalPath=request.files?.avatar[0]?.path;
   const coverImageLocalPath=request.files?.coverImage[0]?.path;
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
   }
   const avatar=  await uploadOnCloudinary(avatarLocalPath)
   const coverImage=  await uploadOnCloudinary(coverImageLocalPath)
   if(!avatar){
    throw new ApiError(400,"Avatar is required")
   }

  const user=await User.create({
    fullName,
    email,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    password,
    username:username.toLowerCase()
   })
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500,"Internal server error")
   }
   return response.status(201).json(
    new ApiResponse (200,createdUser,"User Registered Successfully")
   )
})
export {registerUser}