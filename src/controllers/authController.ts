import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type {Request ,Response} from 'express';
import { Users } from '../models/Users.js';
import { User } from '../models/Users.js';

export const verifyLogin =async(req:Request,res:Response)=>{
 
    const {username ,password} = req.body || {};
     if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }
    const user:User | null =await Users.findOne({username});
    if(!user){
        return res.status(409).json({
            success:false,
            message:"User not found",
            token:null
        })
    }
   let bool:boolean= await bcrypt.compare( password,user.password);
   if(bool){
    if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}
    let token = jwt.sign({username},process.env.SECRET_KEY);
    return res.status(201).json({
        token,
        success:true,
        message:"User logged in"
    })
   }else{
    return res.status(402).json({
        success:false,
        token:null,
         message:"Invalid creds"
    })
   }
}


export const addUser=async(req:Request ,res:Response)=>{
       try {
        
        const {username,password} = req.body ||{} ;
        //   console.log("Body:", req.body); 
         if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }
       let user: User | null =await Users.findOne({username});
      
       if(user){
        return res.status(409).json({
            message:"User already exist",
            success:false
        });
       }
            let pass_hash = bcrypt.hashSync(password, 10);
            let created_User= await Users.create({username,password:pass_hash});
           
            if(!created_User){
                return res.status(500).json({
                    message:"Interval Server crash",
                    success:false
                })
            }
            await created_User.save();

            return res.status(201).json({
                message:"User signed up successfully",
                success:true
            })
       } catch (error:any)  {
            return res.status(500).json({
                message:error.message || "Internal server issue",
                success:false
            })
       }
}

