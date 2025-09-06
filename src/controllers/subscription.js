import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getUserChannelSubscribers = asyncHandler(async(req, res)=>{
    /*steps of getUserChannelSubscribers:
    1> take the channeld from the user
    2> then if channeld is not there throw the console.error
    3> use findById to get the channel
    4> after getting the channel get the subscribers
    5> if didn't get the user or subscribers give back the error 
    6> give the res
    */
 
})

