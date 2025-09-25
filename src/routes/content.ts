
import { Router,Request,Response } from "express";
import { middleWareAuth } from "../middleware/index.js";
import { content } from "../models/Content.js";
import jwt ,{JwtPayload} from 'jsonwebtoken';
import { Users } from "../models/Users.js";
import { tag } from "../models/Tag.js";

const router=Router();  

router.post('/content', middleWareAuth,async(req:Request,res:Response)=>{    
        try {
          let {type,link,title,tags}=req.body;
        let token = req.headers['token'];  
             if (!token || Array.isArray(token)) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }
        if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}
         const decoded= jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
         if(decoded.username){
          let user= await Users.findOne({username : decoded?.username});
           if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
    }

    let contentTags=[];
         if(tags.length>0){
            for(let s of tags){
              let t=  await tag.findOne({title:s});
              if(!t){
                t= await tag.create({title:s});
              }
              contentTags.push(t);
            }
        }
         let cn= await content.create({type,link,title,tags:contentTags,userId: user._id });
          await cn.save();
            return res.status(201).json({
                success:true,
                message:"Content has been posted",
            })
         }else{
            return res.status(401).json({
                   success:false,
                message:"Invalid creds used Please login again",
            })
         }
    
        } catch (error:any) {
                return res.status(500).json({
                    message: error.message||"Internal Server Error",
                    success:false
                })
        }

    })
    router.get('/content' , middleWareAuth,async(req:Request, res:Response)=>{
        
        try {
         let token = req.token!;
              if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}
         const decoded= jwt.verify(token,process.env.SECRET_KEY) as JwtPayload;
      if(!decoded.username){
               return res.status(402).json({
                message:"User not available in this db ,Please login again",
                success:false
            })
         }

         const user=  await Users.findOne({username:decoded.username});
         if(!user){
            return res.status(402).json({
                message:"User of this post not available in this db ,Please login again",
                success:false
            })
         }
         const payload= await content.find({userId:user._id});  
         if(!payload){
            return res.status(201).json({
                message:"No content posted under this handle",
                success:false
            })

         }
         return res.status(201).json({
                content:payload,
                success:true,
                message:'Retrieval Success'
            }) 
        } catch (error : any) {
            return res.status(500).json({
                success:false,
                message:error.message || "Internal server error"
            })
        }
        
    })

    router.delete('/content' , middleWareAuth, async(req:Request,res:Response)=>{
        try {
         let token = req.token!;
        let {contentId}=req.body;
              if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}
         const decoded= jwt.verify(token,process.env.SECRET_KEY) as JwtPayload;
      if(!decoded.username){
               return res.status(402).json({
                message:"User not available in this db ,Please login again",
                success:false
            })
         }

         const user=  await Users.findOne({username:decoded.username});
         if(!user){
            return res.status(402).json({
                message:"User of this post not available in this db ,Please login again",
                success:false
            })
         }

       const payload = await content.find({ userId: user._id }).sort({ _id: -1 });
      let doc_del= payload[contentId];
      if(!doc_del){
        return res.status(403).json({
            success:false,
            message:"No id found"
        })
      }
      await content.findByIdAndDelete(doc_del._id);
      return res.status(201).json({
        success:true,
        message:"The post with the title "+ doc_del.title+" has been deleted" 
      })
        

        } catch (error:any) {
            return res.status(500).json({
                message:error.message || "Internal server Error",
                success:false
            })
        }
    })
    export default router;
