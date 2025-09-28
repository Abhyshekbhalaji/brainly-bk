import {Response,NextFunction } from "express";

import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    token?: string; 
  }
}

export const middleWareAuth=(req:Request,res:Response,next:NextFunction)=>{
   
  const token = req.headers["token"];
          if (!token || Array.isArray(token)) {
      return res.status(401).json({ message: "Login before accessing this route" });
    }

    else{
        req.token = token;
        next();
    }
}