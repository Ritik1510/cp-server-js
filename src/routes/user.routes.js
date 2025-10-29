import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js" 
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken
} from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post(
    registerUser
);

router.route("/login").get(loginUser);

// ----------------------------------------secured routes--------------------------------------
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
