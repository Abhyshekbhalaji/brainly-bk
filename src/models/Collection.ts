import mongoose, { InferSchemaType } from "mongoose";
import { Schema } from 'mongoose';   
import { Users } from "./Users.js";

const collectionSchema = new Schema({
    hashId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "content", 
            required: true
        }
    ],
    collectionId: { 
        type: String, 
        required: true 
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true,
        validate: {
            validator: async function(value: mongoose.Types.ObjectId) {
                const user = await Users.findById(value);
                return !!user;
            },
            message: 'User does not exist'
        }
    },
    created_At: { 
        type: Date, 
        default: Date.now 
    },
    expires_At: { 
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    }
});

// Add compound index for better query performance
collectionSchema.index({ userId: 1, collectionId: 1 }, { unique: true });

export type Collection = InferSchemaType<typeof collectionSchema>;
export const collection = mongoose.model('collection', collectionSchema, 'collection');

// Optional: Type-safe interfaces for better TypeScript support
export interface PopulatedUser {
    _id: mongoose.Types.ObjectId;
    username: string;
}

export interface PopulatedCollection extends Omit<Collection, 'userId'> {
    userId: PopulatedUser;
}