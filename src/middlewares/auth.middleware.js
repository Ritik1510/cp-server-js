import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "_unauthorized request");
        }

        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedtoken?._id).select(
            "-password",
            "-refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "_Token not found or matched_");
        }

        // adding the user to the request object so that helps us to indentify the user is properly loggedin or not
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(
            401,
            error?.message ||
                "_auth middleware Token is not verified successfuly_"
        );
    }
});
