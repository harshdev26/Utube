import { asyncHandler } from "../utils/asyncHandler.js" // after writing this we not have to write try and catch block everytime..
import { ApiError } from  "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js" 
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



   const {fullName, email, username, password }= req.body  // req.body : that is containing the user detail like fullname, email, username, password.
   console.log("email: ", email);

  if (
     [fullName, email, username, password].some((field) =>
     field?.trim() === "") //this will give you the true , if it is true then it will give you the answer that all fields are blank
  ) {
    throw new ApiError(400, "All fields are required") 
  }

  User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with Email or username already exists")
  }

  //middlewares are used to add more fields to the users data.

  const avatarLocalPath =  req.files?.avatar[0].path;           //this line explains that req.files that is provided by multer middleware, will provide the path of the first file.
  const coverImageLocalPath = req.files?.coverImage[0]?.path;   //this line explains that req.files that is provided by multer, will provide the path of the first property of cover image. 

  if(!avatarLocalPath) { 
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)   // dont work until this path uploaded.
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
  username: username.toLowercase() 
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

} )



export  {
    
    registerUser
}