import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const createTweet = asyncHandler(async(req, res)=>{
    /*steps to create tweet:-
    1> take tweet from the user
    2> if empty throw the error
    3> check whether the tweet already exists or not
    4> if already exist throw the error
    5> else use create method to create it
    6> res 
    */
  const { content } = req.body;
  const userId = req.user?._id; // assuming auth middleware sets req.user

  // 1. Validation
  if (!content || !content.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, "User authentication required");
  }

  // 2. Create tweet
  const newTweet = await Tweet.create({
    content,
    owner: userId,
  });

  // 3. Send response
  return res.status(201).json(
    new ApiResponse(201, newTweet, "Tweet created successfully")
  );
})



// GET /api/tweets/:userId


const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        res.status(400);
        throw new Error("User ID is required");
    }

    // Fetch tweets from DB
    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 }) // newest first
        .populate("owner", "username name profilePic"); // optional: include user details

    res.status(200).json({
        success: true,
        count: tweets.length,
        tweets,
    });
});



// PUT /api/tweets/:id
// PATCH /api/tweets/:id
const updateTweet = asyncHandler(async (req, res) => {
    console.log(req.user?._id) //owner ID
    console.log("req.body:", req.body);
    const {tweetId} = req.params
    const { content } = req.body;

    if (!tweetId || !content || content.trim() === "" ) {
        res.status(400);
        throw new Error("Tweet content cannot be empty");
    }

    // Find the tweet
    //    const tweet = await Tweet.find({ tweetId })
    //    if(!tweet){
    //     throw new ApiError(400, "tweet not found")
    //    }
       const updatedTweet = await Tweet.findByIdAndUpdate(
       tweetId,
        {
            
                content
            
        },
        {
            new : true
        }
    )


    res.status(200).json({
        success: true,
        message: "Tweet updated successfully",
        tweet: updatedTweet
    });
});




// DELETE /api/tweets/:id
const deleteTweet = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { tweetId } = req.params; // <-- this should be id, not owner

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        res.status(404);
        throw new Error("Tweet not found");
    }

    // Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to delete this tweet");
    }

    // Delete tweet
    await tweet.deleteOne();

    res.status(200).json({
        success: true,
        message: "Tweet deleted successfully",
    });
});







export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}



 