import mongoose, {Schema} from "mongoose";

const videoSchema=new Schema({
        videoFile:{
            type:String,
            required:true,
        },
        thumbnail:{
            type:String,
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number, //come from couldinary
            required:true,
        },
        views:{
            type:Number, //come from couldinary
            required:true,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        Owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
},{timestamps:true})

export const Video=mongoose.model("Video",videoSchema);