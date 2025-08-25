import mongoose, {Schema} from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" //we use bcrypt to hash passwords that involves encryption,decryption and soon.
const userSchema = new Schema(
    {

      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

      },
      fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      avatar: {
        type: String, //cloudinary url
        required: false
      },

      coverImage: {
        type: String, // cloudinary url
      },

      watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
      ],
      password: {
        type: String,
        required: [true, 'Password is required']
      },
      refreshToken: {
        type: String
      }
    },
      {
        timestamps: true
      }
)


userSchema.pre("save", async function(next) { //before saving run this async function.
    if(!this.isModified("password")) return next(); //if the password is modified then use pre or in this condition if password is not modified then just move to the next.


    this.password = await bcrypt.hash(this.password, 10) //hash password before saving that means will encrypt("convert it into plain unreadble string") the password and 10 is passed as a how many rounds.
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) { //this is a method to check the password is correct or not.
   return await bcrypt.compare(password, this.password) // compare the password with the hash password and bcrypt will return true or false.
}


userSchema.methods.generateAccessToken =  function() { //this is a method to generate the Accesstoken.
 return jwt.sign(   //we are using return with the jwt .sign() function because we want to return the token.
   {
    _id: this._id,      /*all these details coming from database(MONGODB) */
    email: this.email,
    username: this.username,
    fullName: this.fullName
   },
   process.env.ACCESS_TOKEN_SECRET, //this will also be needed which will be fetched from the environment variable to compare the access token of user with the access token of server.
   {
   expiresIn: process.env.ACCESS_TOKEN_EXPIRY // It’s the third argument in jwt.sign(payload, secret, options). so this is the option part of jwt.sign () function. which explains that how long the token will be valid.

   
   },
  )
}

 userSchema.methods.generateRefreshToken =  function() { //this is a method to generate the Accesstoken.
 return jwt.sign(
   {
    _id: this._id,      /*all these details coming from database(MONGODB) */
   },
   process.env.REFRESH_TOKEN_SECRET, //this will also be needed which will be fetched from the environment variable and get compared with the users accses token 
   {
   expiresIn: process.env.REFRESH_TOKEN_EXPIRY // dekho kyu chahie?

   }


)

}

// userSchema.methods.generateAccessToken = function(){} //JWT Token
// userSchema.methods.generateRefreshToken = function(){} //JWT Token

export const User = mongoose.model("User", userSchema)

/*
import  { mongoose, Schema} from mongoose


const userSchema = new Schema({
username : 
  {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  index: true
  }
, 
email : {
 type: required,
 required: true,
 unique: true,
 lowercase: true,
 trim: true,
 index: true
 

}
 
, 
fullname : {
type: String,
required : true,
lowercase: true,
trim: true,
index: true

const user = new Schema({ }, {timestamps: true})

}, 
avatar: {}, 
coverimage, 
[password], 
[refreshToken])

}

,
{ timestamps: true}




*/