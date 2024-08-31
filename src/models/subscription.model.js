import mongoose, { Schema } from "mongoose";

const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // jo subscribe kry ga
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, // jis ko subscribe kia hai
        ref:"User"
    },

},{
    timestamps:true
})

export const Subscription= mongoose.model("Subscription",subscriptionSchema)