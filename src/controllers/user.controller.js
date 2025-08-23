import { asyncHandler } from "../utils/asyncHandler.js" // after writing this we not have to write try and catch block everytime..
import { ApiError } from  "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js" 
const generateAccessandRefreshToken = async(userId) =>{
  try{
    const user =  await User.findById(userId) //get the user details by userId.
    const accessToken = user.generateAccessToken()//we are generating the access token with the help of user details.
    const refreshToken = user.generateRefreshToken() //we are generating the refresh token with the help of user details.
    
    user.refreshToken = refreshToken
    user.save({validateBeforeSave: false}) //dont apply validation before saving 

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
  const coverImageLocalPath = req.files?.coverImage[0]?.path;   //this line explains that req.files that is provided by multer, will provide the path of the first property of cover image. 
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

} )

const loginUser = asyncHandler(async (req,res) => {
     // req-> body
     //username or email
     //find the user
     //password check
     //access and refresh token 
     //send cookie: access and refresh token will be only send through cookies.

 
 
 
 
 
 
  const {email, username, password} = req.body //req.body
  
  if(!username || !email ){ //either username or email will not be there it will generate the error 
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

 const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)


})


const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")

const options = {  // after writing these to attributes our cookie can not be modified
  httpOnly: true,
  secure: true
}




 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
    new ApiResponse(
      200,
      {
        
      }
    )
 ) 
 

export  {
    
    registerUser,
    loginUser
    
}