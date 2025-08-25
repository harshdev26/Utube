//this middleware will verify that the user exist or not.
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js"




export const verifyJWT = asyncHandler(async(req, res, 
    next) => {
      
    try {
      const token = req.cookies?.accessToken || //it will retrieve the jwt token from the cookie which is sended when the user loggedin.
        req.header    //  and header contains a key. 
        ("Authorization")?.replace("Bearer ", ""); //ex:Authorization: Bearer abc123, it will remove the space from the token and will retrieve the key
        console.log("Token received in verifyJWT:", token);

        if(!token) {
          throw new ApiError(401, "Unauthorized request")
        }
      
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      
      const user = await User.findById(decodedToken?._id).select
      ("-password -refreshToken")
     
       
      if (!user) {
        // NEXT_VIDEO: discuss about frontend
        throw new ApiError(401, "Invalid Access Token")
      }
  
      req.user = user;
      next()
    } catch (error) {
      throw new ApiError(401, error?.message || 
        "Invalid access token"
      )
    }

    })