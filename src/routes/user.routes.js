import { Router } from "express";
import registerUser from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([ // middleware to handle multiple file uploads
        // jate hoye ham se milte jana 
        {
            name: "avatar", 
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser
)
export default router; 