const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((error)=>next(error))
    }

}

export {asyncHandler}

// const asynchandler=(fn)=> async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
        
//     } catch (error) {
//         res.status(err.code || 500).json(
//             {
//                 success:false,
//                 message:error.message
//             }
//         )
        
//     }
// } //Higher order funcation wo hota hai jis me function ko as parameter accept kia jata hai
    

