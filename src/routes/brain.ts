
import Router from 'express';
import { middleWareAuth } from '../middleware/index.js';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Users } from '../models/Users.js';
import { content } from '../models/Content.js';
import bcrypt from 'bcrypt';
import { link } from '../models/Link.js';
import dotenv from "dotenv";
import mongoose from 'mongoose';
dotenv.config();
const router=Router();


router.post('/brain/share', middleWareAuth, async (req, res) => {
    try {
        const { share, contentId } = req.body;  // ✅ Fixed destructuring
        
        // ✅ Validate required fields
        if (!contentId) {
            return res.status(400).json({
                success: false,
                message: "Content ID is required"
            });
        }

        if (typeof share !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Share parameter must be a boolean"
            });
        }

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is missing in environment variables");
        }

        const token = req.token!;
        const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
        
        if (!decoded || !decoded.username) {
            return res.status(403).json({
                success: false,
                message: "Invalid token or user not found"
            });
        }

        const loggedUser = await Users.findOne({ username: decoded.username });
        if (!loggedUser || !loggedUser._id) {
            return res.status(403).json({
                success: false,
                message: "User not found or deactivated"
            });
        }

    
        if (!mongoose.isValidObjectId(contentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid content ID format"
            });
        }


        const post = await content.findOne({ 
            userId: loggedUser._id, 
            _id: contentId 
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found or you don't have permission to share it"
            });
        }

        if (share) {
            const existingLink = await link.findOne({
                userId: loggedUser._id,
                postId: contentId
            });

            if (existingLink) {
                const base_url = process.env.DEPLOY_URL || 'http://localhost:3000/';
                const share_url = base_url + 'share/link?hashId=' + existingLink.hashId;
                
                return res.status(200).json({
                    success: true,
                    share_url,
                    message: "Share link already exists"
                });
            }

            // ✅ Create new share link
            const base_url = process.env.DEPLOY_URL || 'http://localhost:3000/';
            const hash_id = bcrypt.hashSync(contentId, 12);
            
            const shareLink = await link.create({
                hashId: hash_id,
                postId: contentId,  // ✅ Store contentId, not the entire post object
                userId: loggedUser._id
            });

            const share_url = base_url + 'share/link?hashId=' + hash_id;
            
            return res.status(201).json({
                success: true,
                share_url,
                message: "Link has been generated successfully!!"
            });
            
        } else {
  
            const deletedLink = await link.deleteOne({
                userId: loggedUser._id,
                postId: contentId
            });

            if (deletedLink.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No share link found to revoke"
                });
            }

            return res.status(200).json({
                message: "Brain access has been revoked",
                success: true
            });
        }

    } catch (error: any) {
        console.error('Share endpoint error:', error);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            success: false
        });
    }
});


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

