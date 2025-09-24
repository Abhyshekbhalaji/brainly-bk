import mongoose, { InferSchemaType, StringSchemaDefinition } from "mongoose";

import {Schema} from 'mongoose';    


const users = new Schema({
   username:{type:String, required:true},
   password:{type:String,required:true}
})

export type User =InferSchemaType<typeof users>
export const Users = mongoose.model('users',users,'users');
