import mongoose, { InferSchemaType } from "mongoose";

import {Schema} from 'mongoose';   
import { Users } from "./Users.js";

const contentSchema = new Schema({
    title:{type:String ,required:true},
    link:{type:String},
    body:{type:String},
    type:{type:String, enum:['Video','Tweet','Link','Document'],required:true},
    tags:[{type:mongoose.Types.ObjectId,ref:'tags'}],
    userId:{type:mongoose.Types.ObjectId,ref:'users' ,required:true, validate:async function(value:mongoose.Types.ObjectId){
        const user =await Users.findById(value);
        if(!user)  throw new Error('User doesnt exist')
    }}
},{ timestamps: true })

export type Content = InferSchemaType<typeof contentSchema>

export const content=mongoose.model('content',contentSchema,'content');