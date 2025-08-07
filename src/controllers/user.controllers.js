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
    [ username, fullName, email, password ].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "_All field values are required_");
  }

  // 2.
  const existedUser = await User.findOne({
    $or: [ { username }, { email } ],
  });

  // 3.
  if (existedUser) {
    throw new ApiError(
      409,
      "_User already exists with this username or email_"
    );
  }

  // 4.
  const avatarLocalPath = req.files?.avatar[ 0 ]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "_Avatar image is required_");
  }
  console.log("avatar local path :", avatarLocalPath);

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[ 0 ].path;
  }

  // 5.
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "_Avatar file is required_");
  }

  // 6.
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
    throw new ApiError(
      500,
      "_something went wrong while registering user_"
    );
  }

  // 9.
  // send the created user data as response
  res.status(201) // status for response
    .json(
      new ApiResponses(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // 1. get the data from frontend/request body
  // 2. set check for what type of user login wants email based or username based, use mongodb operators to based login
  // 3. validate the email or username and password is avilable in db
  // 4. password check about the login user is actual a user.
  // 4. generate the accessToken and refreshToken for granting the user to access all the features
  // 5. save the accesstoken and refresh token to the db
  // 6. send success flag to the frontend as response [ OR ] send cookies

  const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findOne(userId);
      const accessToken = user.generateAccesstoken();
      const refreshToken = user.generateRefreshtoken();

      // adding the refresh token to the user document that is comming from mongodb
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false }); // bcz whenever we use save method, it automatically trigger the other fields

      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "_Something went wrong while generating access and refresh token_"
      );
    }
  };

  // 1.
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(401, "_username or password required!_");
  }

  const user = await User.findOne({
    $or: [ { username }, { email } ],
  });

  if (!user) {
    throw new ApiError(404, "_User does not exist_");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "_Invalid user credentials_");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    user._id
  ); // pass the user id,

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // option for cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponses(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // first get user object from db by the refrence of req.user._id
  // set the refresh token to undefined
  // clear the stored cookies
  // response to the user

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponses(200, null, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
