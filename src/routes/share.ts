import { Router } from "express";
import { link } from "../models/Link.js";
import { content } from "../models/Content.js";
const router=Router();

router.get('/link',async(req,res)=>{

    try {
      let hash_id = req.query.hashId;   
    
     let con= await link.findOne({hashId:hash_id});


     if(!con){
        return res.status(403).json({
            success:false,
            message:"Access denied to the content",
            post:null
        })
     }

    let post= await content.findById(con.postId).populate("tags","title").populate("userId","username").exec();

     return res.status(201).json({
        success:true,
        message:"Post is retrieved from the user",
        posts:post       
        })
    } catch (error:any) {
        return res.status(500).send({
            message:error.message || "Internal server error",
            success:false
        })
    }
})

export default router;