import { Router } from "express";
import { link } from "../models/Link.js";
import { content } from "../models/Content.js";
import { collection } from "../models/Collection.js";
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

router.get('/collection', async (req, res) => {
    try {
        let hashId = req.query.hashId;
        
        if (!hashId || Array.isArray(hashId)) {
            return res.status(400).json({
                message: "Valid hashId parameter is required",
                success: false
            });
        }
        
        // Find collection and populate posts
        let doc = await collection.findOne({ hashId })
            .populate({
                path: 'posts',
                model: 'content'
            })
            .populate({
                path: 'userId',
                model: 'users',
                select: 'username'
            });
        
        if (!doc) {
            return res.status(404).json({
                message: "Collection not found or link has expired",
                success: false
            });
        }
        

        if (doc.expires_At && new Date() > doc.expires_At) {
            await collection.findByIdAndDelete(doc._id);
            return res.status(410).json({
                message: "Collection link has expired",
                success: false
            });
        }
        

        let createdBy = 'Unknown';
        if (doc.userId && typeof doc.userId === 'object' && 'username' in doc.userId) {
            createdBy = (doc.userId as any).username;
        }
        
        return res.status(200).json({
            message: "Collection retrieved successfully",
            success: true,
            data: {
                posts: doc.posts,
                createdBy: createdBy,
                createdAt: doc.created_At,
                expiresAt: doc.expires_At
            }
        });
        
    } catch (error) {
        console.error('Error retrieving collection:', error);
     
        return res.status(500).json({
            message: error instanceof Error ? error.message : "Internal server error",
            success: false
        });
    }
});


export default router;