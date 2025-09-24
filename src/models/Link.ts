import mongoose, { InferSchemaType } from "mongoose";
import { Schema } from "mongoose";
const links =new Schema({
    hashId:{type:String , required:true},
    postId:{type:mongoose.Types.ObjectId,required:true},
    userId:{type:mongoose.Types.ObjectId, required:true},
    created_At : {type:Date, default:Date.now()},
    expires_At:{type:Date}
})

links.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export type Link = InferSchemaType<typeof links>;

export const link = mongoose.model("links",links,'links');
