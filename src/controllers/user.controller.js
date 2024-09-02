import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { response } from "express";
import mongoose from "mongoose";
const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
       const refreshToken= user.generateRefreshToken()
       user.refreshToken=refreshToken
       user.accessToken=accessToken
       await user.save({validateBeforeSave:false})
       return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
        
    }

}
//  register User 
const registerUser=asyncHandler(async(request,response)=>{
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
    const  existedUser= await User.findOne({
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
// --------------------------------------------------------------------------------------------------------------------------------




//  login User
const loginUser=asyncHandler(async(request,response)=>{
    // req body se data lena hai
    // username or email ko check krna
    // user ko database me find krna
    // password check krna correct hai k nai
    // access and refresh token
    // send cookie
    // response send kr do

    const {email,username,password}= request.body

    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }
    const user= await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"user does not exist")
    }
    console.log(password);
        // small user is liye use kr rahy hain q k ye hm ne kud functions banae hai mongoose nai dey raha
     const isPasswordValid= await user.isPasswordCorrect(password)
     if(!isPasswordValid){
        console.log(isPasswordValid)
        throw new ApiError (404, "Password you Enter is not Valid")
     }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    // ye option cookies k liye hain
    const options={
        httpOnly:true,
        secure:true
    }
    console.log(loggedInUser);

    return response.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
    "User Logged In Successfully")
    )
})
// --------------------------------------------------------------------------------------------------------------------------------

// Logged out User
const logoutUser=asyncHandler(async(request,response)=>{
    request.user._id

    await User.findByIdAndUpdate( request.user._id,
        {
        $set:{
            refreshToken:undefined,
        },
    },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return response.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out Successfully"))

})
// --------------------------------------------------------------------------------------------------------------------------------


// Refresh Access Token
const refreshAccessToken=asyncHandler(async()=>{

   const incomingRefreshToken= request.cookies.refreshToken || request.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
   }

 try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    if(!decodedToken){
     throw new ApiError(401,"Invalid Token")
    }
   const user=await User.findById(decordedToken?._id)
   if(!user){
     throw new ApiError(401,"Invalid Token")
   }
 
   if(incomingRefreshToken!== user?.refreshToken){
     throw new ApiError(401,"Refresh Token is expired or used")
 
   }
   const options={
     httpOnly:true,
     secure:true,
   }
   const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
 
   return response
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
     new ApiResponse(
         200,{
             accessToken,newRefreshToken
         },
         "Access Token Refreshed"
     )
   )
    
 } catch (error) {

    throw new ApiError(401,error?.message || "Invalid Refresh Token")
    
 }

})

// --------------------------------------------------------------------------------------------------------------------------------
const changeCurrentPassword=asyncHandler(async(request,response)=>{
    const {oldPassword,newPassword}=req.body
   const user=await User.findById(req.user?._id)
   const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
   if(!isPasswordCorrect){
    throw  new ApiError(401,"InValid Old Password")
   }
   user.password=newPassword
   await User.save({validateBeforeSave:false})

   return response
   .status(200)
   .json(new ApiResponse(200,{},"Password changed successfully"))
})
const getCurrentUser=asyncHandler(async(request,response)=>{
    return response
    .status(200)
    .json(
        200,request.user,"current user fetched"
    )

})

const updateAccountDetails=asyncHandler(async(request,response)=>{

    const {fullName,email}=request.body;

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user= await User.findByIdAndUpdate(request.user?._id,
        {
            $set:{
                fullName,
                email,
            }
        },
        {new:true}).select("-password")
        return response
        .status(200)
        .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(request,response)=>{
    const avatarLocalPath=request.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Avatar api uploading error")
    }

 const user=  await User.findByIdAndUpdate(request.user?._id,{
        $set:{
            avatar:avatar?.url
        }

        },
{
    new:true

}).select("-password")


    return response
    .status(200)
    .json(
        new ApiResponse(200,user,"User Avatar has been updated successfully")
    )
})

const getUserChannelProfile=asyncHandler(async(request,response)=>{

    const {username}=request.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel=await User.aggregate(
        [
            {
                $match:{
                    username:username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscribersCount:{
                        $size:"$subscribers"
                    },
                    channelsSubscribedToCount:{
                        $size:"$subscribedTo"
                    },
                    isSubscribed:{
                        $cond:{
                            if:{$in:[request.user?._id,"$subscribers.subscriber"]},
                            then:true,
                            else:false
                        }
                    }

                }
            },
            {
                $project:{
                    fullName:1,
                    username:1,
                    subscribersCount:1,
                    channelsSubscribedToCount:1,
                    isSubscribed:1,
                    avatar:1,
                    coverImage:1,
                    email:1
                }
            }
        ]
    )
if(!channel?.length){
    throw new ApiError(404, "Channel does not exists")
}
console.log(channel);
return res
.status(200)
.json(
    new ApiResponse(200,
        channel[0],
        "User channel fetched successfully"
    )
)
   

})

const getWatchHistory=asyncHandler(async(request,response)=>{
    const user=await User.aggregate([

        {
            $match:{
                _id:new mongoose.Types.ObjectId(request.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[   // sub pipeline
                    {
                        $lookup:{
                            from:"users",
                            localFields:"owner",
                            ForeignField:"_id",
                            as:"owner",
                            pipeline:[{      // sub pipeline ye sirf owner me apply hogi
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }]
                        }
                    },
                    {  // is liye lagai hai taka k owner array me na ho object me mily bs
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])

    return response
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"))
})
export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,getUserChannelProfile,getWatchHistory}