import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponses } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken"

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

const registerUser = asyncHandler(async (req, res) => {
  // 1. get the user data from the frontend
  // 2. validate the user data - not empty
  // 3. check the user have already a account or not - email, username
  // 4. get the avatar and coverimage, make sure the avatar is uploaded correctly
  // 6. create user object - create entry in db
  // 7. remove password and refresh token filed from the the response.
  // 8. check for the user creation
  // 9. return res

  // 1.
  const { username, fullName, email, password, role } = req.body;
  if (
    [ username, fullName, email, password, role ].some((field) => {
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

  // 6.
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    role
  });

  const {accessToken, refreshToken} = generateAccessAndRefreshTokens(user._id); 
   
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

  // option for cookies
  const options = {
    httpOnly: true,      // JS cannot access, protects against XSS
    secure: true,        // Only sent over HTTPS
    sameSite: 'strict',  // Not sent with cross-site requests (CSRF protection)
    path: '/',           // Available to entire site
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week, adjust as needed
  };

  // 9.
  // send the created user data as response
  res
    .cookie("accessToken", accessToken, options)
    .status(201) // status for response
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

  // 1.
  const { username, email, password } = req.body;
  if (!username && !email) {
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

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
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
  // 1. first get user object from db by the refrence of req.user._id
  // 2. set the refresh token to undefined 
  // 3. clear the stored cookies
  // 4. response to the user

  // 1.
  await User.findByIdAndUpdate(
    req.user._id, // 1.
    {
      $set: { // 2.
        refreshToken: undefined,
      },
    },
    {
      new: true, // return the updated user object
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // [3, 4]
  res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponses(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. get the refresh token from the cookies or from request body 
  // 2. validate the refresh token, is it avilable or not 
  // 3. verify the token using jwt functions and store it for later usages as decodedToken
  // 4. find the user with the help of user id, Here, the user id is extracted from the decoded token
  // 5. validate the user 
  // 6. match the incoming token with the saved referesh token that is avilable in db already 
  // 7. generate the new token for user  with the help of user id
  // 8. send the tokens to the user via cookies and set response to the user 

  // 1.
  const incommingRefreshtoken = req.cookie.refreshToken || req.body.refreshToken;

  // 2.
  if (!incommingRefreshtoken) {
    throw new ApiError(401, "_Invalid token or unable to get the token from cookies while refreshing the token_");
  }
  console.log("incomming token: ", incommingRefreshtoken);

  try {
    // 3.
    const decodedToken = jwt.verify(incommingRefreshtoken, process.env.REFRESH_TOKEN_SECRET);

    // 4.
    const user = await User.findById(decodedToken?._id);

    // 5.
    if (!user) {
      throw new ApiError(401, "_unauthorized access or invalid request_");
    }

    // 6.
    if (incommingRefreshtoken !== user?.refreshToken) {
      throw new ApiError(401, "_Refresh token mismatch_");
    }

    // 7.
    const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(decodedToken?._id);

    const options = {
      httpOnly: true,
      secure: true
    }

    // 8.
    res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponses(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "New access and refresh token generated successfully")
      )
  } catch (error) {

  }
})

export { registerUser, loginUser, logoutUser, generateAccessAndRefreshTokens, refreshAccessToken };
