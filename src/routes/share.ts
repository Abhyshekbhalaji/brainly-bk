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
            message:"Invalid hashId. Check the url",

            post:null
        })
     }

    let post= await content.findById(con.postId)

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