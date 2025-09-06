import mongoose, {isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";





const createPlaylist = asyncHandler(async(req, res)=>{
    const {name, description, videos} = req.body
    if(!name || !description){
        throw new ApiError(400,"User details are required")
    }
      
    const newPlaylist = await Playlist.create({
        name,
        description,
        videos: videos,
        owner: req.user._id
  });

  res
  .status(200)
  .json(
    new ApiResponse
    (200, 
    {newPlaylist}, 
    "Playlist created Successfully"
    )
  )

})



const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log(userId)
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Valid userId is required");
  }

  const playlists = await Playlist.find({ owner: req.user._id });



  res.status(200).json(
    new ApiResponse(200, playlists, "User playlists fetched successfully")
  );
});



const getPlaylistById = asyncHandler(async(req,res)=>{
    console.log(req.params)
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400, "user id is not there")
    }

    const userPlaylist = await Playlist.findById(playlistId);

    if (!userPlaylist) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            { data: userPlaylist },
            "User playlist fetched successfully"
        )
    );

})


const addVideoToPlaylist = asyncHandler(async(req, res)=>{
   /* steps for addVideoToPlaylist:
   1> take videoId from the users body
   2> if video is not there then throw error 
   3> playlist id and video id should match
   4> if doesn't match throw the error
   5> give back the response  
   */
 
  const {name, videoId, PlaylistId} =  req.params
  
  if(
    [name, videoId, PlaylistId].some((field)=>
      field?.trim === "")
  ){
    throw new ApiError(400, "All Fields are required")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    PlaylistId,
    {
     $push:{
        videos : videoId
    }
    },{
        new: true
    });

   if(!newVideo){
    throw new ApiError(402, "playlist not found")
   }
  
   res.status(200).json(
    new ApiResponse(
      200,
      { playlist: updatedPlaylist },
      "Video added to playlist successfully"
    )
  );
})

const removeVideoFromPlaylist = asyncHandler(async(req, res)=>{
    /* steps to removeVideoFromPlaylist
    
    1> take the req body: videoId, playlistId, name
    2> if details are not provided then throw the error
    3> get the playlist by using the findById
    4> update the playlist after removing the video from the playlist using pull
    5> send the response
    
    */


  const {videoId, playlistId} =  req.params;
  
  if(!videoId || !playlistId){
    throw new ApiError(400, "all details required");
  }

  const playlist = await Playlist.findById(playlistId);
 
  if(!playlist){
    throw new ApiError(404, "playlist not found")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        $pull: {
            videos : videoId
        }
    },{
        new:true
    }
  )

  res
  .status(200)
  .json(
    new ApiResponse(200, {updatedPlaylist}, "video successfully removed from the playlist")
  )

})



const deletePlaylist = asyncHandler(async (req, res)=>{
    const {playlistId} =  req.params

/* steps to delete playlist:
1>take playlistId from the user 
2>if playlistId is not valid or empty throw the error 
3>check whether the playlist exist or not
4>if playlist not exist throw the error
5>remove the playlist from the Playlists 
6>give back the response
*/

 if(!playlistId){
    throw new ApiError(400,"Playlist is not there!")
 }

 const playlist = await Playlist.findById(playlistId)

 if(!playlist){
    throw new ApiError("Playlist not exist")
 }

 const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
 
 res
 .status(200)
 .json(
    new ApiResponse(200, deletedPlaylist, "playlist removed successfully")
 )

})

const updatedPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  // Validate playlistId
  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlistId is required");
  }

  // Ensure at least one field provided
  if (!name && !description) {
    throw new ApiError(400, "At least one field (name or description) is required");
  }

  // Check playlist existence
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Prepare update object
  const updateData = {};
  if (name?.trim()) updateData.name = name.trim();
  if (description?.trim()) updateData.description = description.trim();

  // Update playlist
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: updateData },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
  );
});





export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatedPlaylist
}



