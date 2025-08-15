import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js" 
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        // middleware to handle multiple file uploads
        // jate hoye ham se milte jana
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
export default router;
router.route("/refresh-token").post(refreshAccessToken);
