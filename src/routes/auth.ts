

/// sign in and sign up

import { verifyLogin , addUser } from "../controllers/authController.js";
import { Router } from "express";

const router= Router();


router.post('/login',verifyLogin);

router.post('/signup',addUser);
export default router;