import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponses } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. get the user data from the frontend
  // 2. validate the user data - not empty
  // 3. check the user have already a account or not - email, username
  // 4. get the avatar and coverimage, make sure the avatar is uploaded correctly
  // 5. upload to the cloudinary
  // 6. create user object - create entry in db
  // 7. remove password and refresh token filed from the the response.
  // 8. check for the user creation
  // 9. return res

  // 1.
  const { username, fullName, email, password } = req.body;
  if (
    [username, fullName, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "_All field values are required_");
  }
  
  // 2.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log("existed user details message :", existedUser);

  // 3.
  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  // 4.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "_Avatar image is required_");
  }
  console.log("avatar local path :", avatarLocalPath);
  
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "_Cover image is required_");
  }
  console.log("cover image local path :", coverImageLocalPath);

  // 5.
  // upload the images to the cloudinary database
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "_Avatar file is required_");
  }

  // 6.
  // database entry for creation of User object.
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "_No cover image found_", // `?` means, if the coverimage is avilable then save it otherwise store empty string
  });

  // 7. 
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // selecting fields to exclude from the response

  // 8.
  if (!createdUser) {
    throw new ApiError(500, "_something went wrong while registering user_");
  }

  // 9.
  // send the created user data as response
  res
    .status(201) // status for response
    .json(new ApiResponses(200, createdUser, "User registered successfully"));
});

export default registerUser;
