import mongoose, { InferSchemaType } from "mongoose";

import { Schema } from "mongoose";

const tagSchema =new Schema({
    title:{type:String , required:true} 
})

export type Tag= InferSchemaType<typeof tagSchema>;
export const tag = mongoose.model("tags",tagSchema,'tags');
