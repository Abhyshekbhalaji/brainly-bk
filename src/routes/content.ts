
import { Router,Request,Response } from "express";
import { middleWareAuth } from "../middleware/index.js";
import { content } from "../models/Content.js";
import jwt ,{JwtPayload} from 'jsonwebtoken';
import { Users } from "../models/Users.js";
import {  tag } from "../models/Tag.js";
import mongoose from "mongoose";

const router=Router();  

router.post('/content', middleWareAuth,async(req:Request,res:Response)=>{    
        try {
          let {type,link,title,tags,body=null}=req.body;
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
         let cn= await content.create({type,link,title,tags:contentTags,userId: user._id,body});
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
     const payload = await content
  .find({ userId: user._id })
  .populate('tags', 'title')
  .sort({ _id: -1 })
  .exec();
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


    router.get('/content/search' , middleWareAuth,async(req:Request, res:Response)=>{
        try {
         let token = req.token!;
         let queryTitle = req.query.title;
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
         const payload= await content.find({title: { $regex: queryTitle, $options: "i" }});  
         if (!payload || payload.length === 0) {
   return res.status(404).json({
     message: "No content found with that title",
     success: false
   });
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


    router.put('/content/edit',middleWareAuth,async(req:Request,res:Response)=>{
        try {
          let contentId =req.query.id;
        
          let {title,link,tags,type}=req.body;
          if(!contentId){
            return res.status(403).json({
              success:false,
              message:"Id is required",
            })
          }

          let token = req.headers['token']?.toString();
          if(!token) {
               return res.status(403).json({
              success:false,
              message:"Login before editing",
            })
          } 
                  if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}
          let {username}  = jwt.verify(token,process.env.SECRET_KEY) as JwtPayload;

         let user= await Users.findOne({username});
         if(!user){
          return res.status(403).json({
            succcess:false,
            message:"No user found"
          })
        }
        let existing= await content.find({userId:user._id}).sort({_id:-1});


        if(!existing){
          return res.status(403).json({
            succcess:false,
            message:"No post found"
          })
        }
       let curIndex=Number(contentId);
      

       let currentPost= existing[curIndex];
        if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found at given index",
      });
    }
  

      if(title) currentPost.title=title;
      if(link) currentPost.link=link;
      if(tags) currentPost.tags=tags;
      if(type) currentPost.type=type;
    
        await currentPost.save();

        return res.status(201).json({
          success:true,
          message:"Title Updated successfully"
        })

        } catch (error : any) {
              return res.status(500).json({
                success:false,
                message:error.message || "Internal server error"
            }) 
        }
    })

 
router.delete('/content', middleWareAuth, async (req: Request, res: Response) => {
    try {
        const token = req.token!;
        const { contentId } = req.body;

  

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is missing in environment variables");
        }

    
        if (!mongoose.isValidObjectId(contentId)) {
  
            return res.status(400).json({
                success: false,
                message: "Invalid content ID"
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
        if (!decoded.username) {
            return res.status(401).json({
                success: false,
                message: "Invalid user. Please login again"
            });
        }

        const user = await Users.findOne({ username: decoded.username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again"
            });
        }

        const contentToDelete = await content.findOne({ 
            _id: contentId, 
            userId: user._id 
        });

        if (!contentToDelete) {
            console.log('Content not found for deletion:', contentId, 'User:', user._id); // ✅ Debug log
            return res.status(403).json({
                success: false,
                message: "Content not found or you don't have permission to delete it"
            });
        }

     

        const deletedContent = await content.findByIdAndDelete(contentId);
        
        if (!deletedContent) {
            throw new Error('Failed to delete content');
        }



        return res.status(200).json({
            success: true,
            message: `The post titled '${contentToDelete.title}' has been deleted`,
            deletedId: contentId 
        });

    } catch (error: any) {
        console.error('Delete error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
      }
    })
    

    export default router;
