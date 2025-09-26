
import Router from 'express';
import { middleWareAuth } from '../middleware/index.js';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Users } from '../models/Users.js';
import { content } from '../models/Content.js';
import bcrypt from 'bcrypt';
import { link } from '../models/Link.js';
import dotenv from "dotenv";
dotenv.config();
const router=Router();

router.post('/brain/share/:contentId',middleWareAuth , async(req,res)=> {
try {

    let shared= req.body.share!;
    if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}
        let token = req.token!;
    let decoded = jwt.verify(token , process.env.SECRET_KEY) as JwtPayload;
    if(!decoded || !decoded.username){
          return res.status(403).json({
            success:false,
            message:"User might have deactivated or not found"
        })
    }
    let loggedUser= await Users.findOne({username:decoded.username});

    if(!loggedUser || !loggedUser._id ){
        return res.status(403).json({
            success:false,
            message:"User might have deactivated or not found"
        })
    }
    if(!req.params.contentId){
        return res.status(403).json({
            success:false,
            message:"Post id is not passed"
        })
    }

    let contentId =parseInt(req?.params?.contentId);

    let posts= await content.find({userId:loggedUser._id}).sort({_id:-1});

    if(!posts){
             return res.status(403).json({
            success:false,
            message:"User has no post to share"
        })
    }
    let post_id= posts[contentId]!._id.toString();
 
   


    if(shared){
     
       const base_url=process.env.DEPLOY_URL? process.env.DEPLOY_URL:'http://localhost:3000/'
     let hash_id = bcrypt.hashSync(post_id,12);
   
    let share =await link.create({hashId:hash_id ,postId:posts[contentId], userId:loggedUser});
        await share.save();
  let share_url=base_url+'share/link?hashId='+hash_id;
        return res.status(201).json({
            success:true,
            share_url,
            message:"Link has been generated successfully!!" 
        })
    }else{
        await link.deleteOne({
            userId:loggedUser._id,
            postId:post_id
        })

        return res.status(201).json({
            message:"brain access has been revoked",
            success:true
        })

    }
   
} catch (error : any) {
        return res.status(500).json({
            message:error.message || "Internal Server error",
            success:false
        })
}
    // [fetch the post via index]
    // hash the post _id and create link 
    // send the hash_ id back to json
})

router.get('/brain/share',middleWareAuth , async(req,res)=> {
try {
    let token = req.token!;
   
if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}
    let decoded = jwt.verify(token , process.env.SECRET_KEY) as JwtPayload;
    if(!decoded || !decoded.username){
          return res.status(403).json({
            success:false,
            message:"User not found  in DB"
        })
    }
    let loggedUser= await Users.findOne({username:decoded.username});
    if(!loggedUser || !loggedUser._id ){
        return res.status(403).json({
            success:false,
            message:"User might have deactivated or not found"
        })
    }
    let posts= await link.find({userId:loggedUser._id}).sort({_id:-1});
    if(!posts){
             return res.status(403).json({
            success:false,
            message:"User has no post to share"
        })
    } 

        return res.status(201).json({
            success:true,
            posts:posts,
            message:"Fetched all the links" 
        })
} catch (error : any) {
        return res.status(500).json({
            message:error.message || "Internal Server error",
            success:false
        })
}

})


export default router;

