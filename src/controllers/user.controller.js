import { asyncHandler } from "../utils/asyncHandler.js" // after writing this we not have to write try and catch block everytime..
import { ApiError } from  "../utils/ApiError.js" //import { ApiError } from  "../utils/ApiError.js"
import { User } from "../models/user.model.js" //Database ka User model import kiya.
import { uploadOnCloudinary } from "../utils/cloudinary.js" //Image ko cloudinary par upload karne ka function.
import { ApiResponse } from "../utils/ApiResponse.js" //Standard format mein response bhejne ka helper.
import jwt from "jsonwebtoken" //Token generate aur verify karne ke liye JWT library.
import mongoose from "mongoose"
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
try {
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



}
catch (error) {
  throw new ApiError(500, "Something went wrong while refreshing access token.");
}
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
  const {oldPassword, newPassword, confPassword} = req.body

  if (!(newPassword === confPassword)) {
    throw new ApiError(401, "newPassword and confPassword should be Same")
  }
  

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.
  isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))


})


const getCurrentUser = asyncHandler(async(req, res)=> {
  return res
  .status(200)
  .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
  const {fullName, email} = req.body
  
  if (!fullName || !email) {
    throw new ApiError(400, "All field are required")
  }
   
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
       $set: {
          fullName,
          email: email
       }  
     
    },
    
    {
      new: true
    }

  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res)=> {
  const avatarLocalPath = req.file?.path
  
  if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
    throw new ApiError(401, "Error while uploading on avatar")
  }
  

 await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      avatar: avatar.url,
    }
  },
  {new: true}
 ).select("-password")


})


const updateUserCoverImage = asyncHandler(async(req, res)=> {
  const coverImageLocalPath = req.file?.path
  
  if(!coverImageLocalPath) {
    throw new ApiError(400, "coverimage file is missing")
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
    throw new ApiError(401, "Error while uploading on coverImage")
  }
  

 await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      coverImage : coverImage.url,
    }
  },
  {new: true}
 ).select("-password")


})

const getUserChannelProfile = asyncHandler(async(req,res) =>{

  const {username} = req.params 

  if(!username?.trim()){
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([ //we used aggregate here instead of findone because to apply multiple operations in database ,User is the current collection and Subscriptions is the another collection(jisme se data aa raha h)
     {
      $match:{
        username: username?.toLowerCase() //$match is used to match the username and retrive the user's data 
      }
    },
    {
      $lookup:{ //$lookup is used to join the two different collections in the database(MONGODB) 
        from: "subscriptions", //it explains that from which collection(subscriptions) we have to retrieve the data.
        localField: "_id",//current collection(User) ka kaun sa field match hoga.
        foreignField: "channel", //foreignField(subscriptions) ka kaun sa field match hoga
        as: "subscribers" //getting the data of subscribers.
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
       $addFields:{         //use to add new field
      subscribersCount: {            //used to count the size of the subscibers Array
        $size: "$subscribers"
      },
      channelsSubscribedToCount: {       //used to count the channelssubscribedto Array size
        $size : "$subscribedTo"         
      },
      isSubscribed: {
        $cond:{
          if: {$in: [req.user?._id, "$subscribers.subsciber"]} //check whether the user is in subscibers array or not?

               }
            }
         } 
      },
      {
        $project:{
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1
        }
      }
   ])

   if(!channel?.length){
    throw new ApiError(404, "channel does not exists")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200, channel[0], "User channel fetched Successfully")
   )
})

const getWatchHistory = asyncHandler(async(req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },{
      $lookup:{
        from: "videos",
        localField: "WatchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]

            }
          }
        ]

      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch history fetched Successfully"
    )
  )


})




export  { 
    
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
    
}


/*
aggregate tab chalate hain jab ek saath multiple kaam karne ho database mein.

👉 Yaha reason:

User ka data lena hai.

Uske subscribers bhi laane hain.

Usne kitne channels ko subscribe kiya woh bhi laana hai.

Saath hi counts aur extra fields calculate karni hain.

Agar sirf .findOne() use karte toh bas user milta, ye extra joined data aur counts nahi milte.

Chahta hai main tujhe iska ek normal .findOne() vs .aggregate() ka difference example bana ke samjhau?



*/






/*
// Dekho simple:

Access token short time ke liye hota hai (minutes / 1 hour). Ye har API call ke sath bhejna padta hai taaki server ko pata chale user kaun hai.

Refresh token long time ke liye hota hai (days / weeks). Ye direct API call me use nahi hota, sirf naya access token lane ke liye use hota hai.

👉 Matlab:

Logged in user bhi access token ke bina API nahi chala sakta, kyunki server ko verify karna hota hai.

Agar access token expire ho jaaye → refresh token se naya access token milta hai, bina dobara login kare. ✅

Bhai chaahe to main ek real-life example (ticket system ya pass system) dekar aur easy bana dun? */