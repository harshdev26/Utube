import { asyncHandler } from "../utils/asyncHandler.js" // after writing this we not have to write try and catch block everytime..
import { ApiError } from  "../utils/ApiError.js" //import { ApiError } from  "../utils/ApiError.js"
import { User } from "../models/user.models.js" //Database ka User model import kiya.
import { uploadOnCloudinary } from "../utils/cloudinary.js" //Image ko cloudinary par upload karne ka function.
import { ApiResponse } from "../utils/ApiResponse.js" //Standard format mein response bhejne ka helper.
import jwt from "jsonwebtoken" //Token generate aur verify karne ke liye JWT library.
//import { user } from "pg/lib/defaults.js"
const generateAccessandRefreshTokens = async(userId) =>{
  try{
    const user =  await User.findById(userId) //get the user details by userId.
    const accessToken = user.generateAccessToken()//we are generating the access token with the help of user details.
    const refreshToken = user.generateRefreshToken() //we are generating the refresh token with the help of user details.
    
    user.refreshToken = refreshToken //we are saving this refresh token in the DB because this is required field and will be revoked again not like access token.
    user.save({validateBeforeSave: false}) //dont apply validation before saving because validation will be revalidate other field as well which is not required.

    return {accessToken, refreshToken}  //returning it to the function called named as generateAccessandRefreshToken in line:140.

  }catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token.")
  }

}
   

const registerUser = asyncHandler( async (req, res) => {  //registerUser: it is writing the function of register the user and asynchandler is just handling any kind of error, which
    // takes the parameters with the async function.
    //res.status(200).json({ // sending the statement to the user using res.status(200) that everything is ok!.
      //  message: "Kaise ho harsh bhai????"
    //})
    // get user details from frontend
    // validation - not empty
    //check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db 
    // remove password and refresh token field from response
    // check for user creation 
    // return res

console.log("FILES RECEIVED ===>", req.files);
console.log("BODY RECEIVED ===>", req.body);



   const {fullName, email, username, password }= req.body  // req.body : that is containing the user detail like fullname, email, username, password.
   console.log("email: ", email);

  if (
     [fullName, email, username, password].some((field) =>
     field?.trim() === "") //this will give you the true , if it is true then it will give you the answer that all fields are blank
  ) {
    throw new ApiError(400, "All fields are required") 
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with Email or username already exists")
  }

  //middlewares are used to add more fields to the users data.

  const avatarLocalPath =  req.files?.avatar[0].path;           //this line explains that req.files that is provided by multer middleware, will provide the path of the first file.
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;   //this line explains that req.files that is provided by multer, will provide the path of the first property of cover image. 
  
     let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
  
  console.log("avatarLocalPath:", avatarLocalPath);

  if(!avatarLocalPath) { 
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)   // dont work until this path uploaded.
  console.log("Cloudinary upload result:", avatar);
  const coverImage =  await uploadOnCloudinary(coverImageLocalPath) //

 if(!avatar) {
  throw new ApiError(400, "Avatar file is required")
 }

const user = await User.create({            //this will create the users detail in the database
  fullName,
  avatar : avatar.url,
  coverImage : coverImage?.url || "", 
  email,
  password,
  username: username.toLowerCase() 
})

const createdUser = await User.findById(user._id).select(  //this will return the data to the user and will not return those to fields password and refreshToken.
       "-password -refreshToken"


) 

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(

     new ApiResponse(200, createdUser, "User registered Successfully")

  )

})

const loginUser = asyncHandler(async (req,res) => {
     // req-> body
     //username or email
     //find the user
     //password check
     //access and refresh token 
     //send cookie: access and refresh token will be only send through cookies.

 
 
 
 
 
 
  const {email, username, password} = req.body //req.body
  
  if(!username && !email ){ //either username or email will not be there it will generate the error 
    throw new ApiError(400, "username or email is required")
  }

 const user = await User.findOne({ //findOne is used basically to find the user data either through username or email.
  $or: [{email},{username}]
 })

 if(!user) {  //if user not exist generate the error 
   throw new ApiError(404, "user doesn't exist")
 }
//difference between user and User : user is refrence of the mongodb response but User is property of mongoose.
 const isPasswordValid = await user.isPasswordCorrect(password) 
 if (!isPasswordValid){  //check the password is password valid or not.
  throw new ApiError(401, "Invalid User Credentials")
 }

 const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)


const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")

const options = {  // after writing these to attributes our cookie can not be modified
  httpOnly: true, //so that it can not be access through javascript just by access through the server.
  secure: true
}

 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options) // we used to send tokens with cookies to make secure to the tokens.
 .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken,
        refreshToken

      },
      "User logged In Successfully"
    )
 ) 

})



const logoutUser = asyncHandler(async(req, res)=> {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
      {
        new: true
      }
    
  )

 const options = {
  httpOnly: true,
  secure: true

 }

 return res 
 .status(200)
 .clearCookie("accessToken", options) // clearing the cookies that is containing the tokens.
 .clearCookie("refreshToken", options)
 .json(new ApiResponse(200, {}, "User logged Out"))



}) 
 

const refreshAccessToken = asyncHandler(async (req,res)=> { //we are generating the refresh token again after logout by the user for the new refresh token when the user will be login.
const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //either the refresh token will be in req.body or req.cookie. till yet user is logged in.

if (!incomingRefreshToken) {
  throw new ApiError(401, "Something went wrong by the user."); 
}
 const decodedToken = jwt.verify( //we are trying to compare the incomingRefreshToken by the user with refresh secret which is saved in server earlier with this if it's find it will decode the details of the user.
  incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET

 )
const user = await User.findById(decodedToken?._id)  //using id that is in decodedToken we can get the user details.
if (!user) {
  throw new ApiError(401, " Invalid refresh token"); 
}

if(incomingRefreshToken !== user?.refreshToken){
  throw new ApiError(401, "Refresh token is expired or used")
 }

 const options = {
   httpOnly: true,
   secure: true
 }
  
 const { accessToken, newRefreshToken} = 
 await generateAccessandRefreshTokens(user._id)

 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", newRefreshToken , options)
 .json(
  new ApiResponse(
    200,
    {accessToken, refreshToken: newRefreshToken},
    "Access token refreshed"
  )
 )
})



export  {
    
    registerUser,
    loginUser,
    logoutUser
    
}


/*
// Dekho simple:

Access token short time ke liye hota hai (minutes / 1 hour). Ye har API call ke sath bhejna padta hai taaki server ko pata chale user kaun hai.

Refresh token long time ke liye hota hai (days / weeks). Ye direct API call me use nahi hota, sirf naya access token lane ke liye use hota hai.

👉 Matlab:

Logged in user bhi access token ke bina API nahi chala sakta, kyunki server ko verify karna hota hai.

Agar access token expire ho jaaye → refresh token se naya access token milta hai, bina dobara login kare. ✅

Bhai chaahe to main ek real-life example (ticket system ya pass system) dekar aur easy bana dun? */