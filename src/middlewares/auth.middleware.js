import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // 1. getting the token from the cookies or from the header
    // 2. check if token is present
    // 3. verifying the token
    // 4. finding the user by id for verification
    // 5. checking if user exists
    // 6. adding the user to the request object so that helps us to indentify the user is properly loggedin or not
    // 7. we call the next middleware

    try {
        // 1.
        console.log("verification starts...");
        const token =
            req.cookies.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        // 2.
        if (!token) {
            throw new ApiError(401, "_Token verification failed or not provided_");
        }
        console.log("Token is present...");
        
        // 3.
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Token is verified...");

        // 4.
        const user = await User.findById(decodedtoken?._id).select(
            "-password"
        );
        console.log("removing the password from the user object...");

        // 5.
        if (!user) {
            throw new ApiError(401, "_Token not found or matched at verification_");
        }

        // 6.
        req.user = user;

        // 7. 
        next();
    } catch (error) {
        throw new ApiError(
            401,
            error?.message ||
            "_auth middleware Token is not verified successfuly_"
        );
    }
});
