// a user can have multiple playlists 
// and each playlist contains multple videos 

import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler"

// what may be the controllers 
// fetch all the playlist of the cur user
// fetch all the videos in a playlist ie get that playlist 
// add a video and delete a video 
// delete playlist 
// update playlist 


//extra 
//we can also find no of like and views for a playlist
//i will add when i have developed the fronted 

const createPlaylist = asyncHandler( async(req,res) =>{
    const  description = req.body.description?.trim() || ""
    const name = req.body.name?.trim() || ""
    const userId = req.user._id;

    //name and description can't be empty 
    if(name=="" || description ==""){
        throw new ApiError(400,"name and descripiton are required")
    }

    //do we need to know all values to create a playlist
    const newPlaylist = await Playlist.create({owner : userId , name : name , description : description})
    //we have option like new : true and validator : true only update or they will be presnet in create also ??
    //okay these option are for the update operations not for the create , it atomatically checks 

    return res
    .status(201)
    .json(new ApiResponse(201,newPlaylist,"new playlist created"))

})

const getUserPlaylists = asyncHandler( async(req,res)=>{
    const {userId} = req.params

    //so we have access to the playlists of other guy just like yt playlist not spotify personal playlists
    //which are only accessible by owner

    //check if it's valid userId 
    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400,"Invalid userId")
    }

    const userPlaylists = await Playlist.find({owner : userId});
    //if there are none will it return empty list or null 
    //if empty list them how (!userPlaylist) becomes true in general ??

    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylists,"user playlists fetched seccessfully"))

})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist fetced successfully"))
})


const addVideoToPlaylist = asyncHandler( async(req,res) => {
    const {playlistId,videoId} = req.params
    const userId = req.user._id
    //check if both are valid or not 
    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlistId or videoId")
    }

    // const playlist = await Playlist.findById(playlistId);
    // if(!playlist){
    //     throw new ApiError(404,"playlist not found")
    // }
    // if(playlist.owner != userId){
    //     throw new ApiError(403,"you are not the owner to add videos to this playlist")
    // }

    // //if playlist is present ans we are authorised to add 
    // // playlist.vidoes.push(videoId);
    // // await playlist.save();

    // //but it has two problems 
    // //we may add that video if it's already present 
    // //it is taking 2 db operation 

    // //we can actually overcome these two 

    // const updatedPlaylist = await Playlist.findByIdAndUpdate(
    //     playlistId,
    //     {$addToSet : {vidoes : videoId}},
    //     {new : true , runValidators : true}
    // ).populate("vidoes","")
    //populate takes 2 parameter 
    //which feild details we have to populate and what feilds we have to populate 

    //what is the user of this findandupdate above we are fetching the playlist to check if exists or not ??
    //if that is present now also we are doing 2 db calls isn't it ??

    //so we can do like this 

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {_id : playlistId , owner : userId},
        {$addToSet : {videos : videoId}},
        {new : true , runValidators : true}
    ).populate("videos" , "title _id")

    if(!updatedPlaylist){
        //either playlist doesn't exist or it's unauthorised 
        throw new ApiError(404,"either playlist doesn't exist or unauthorised request")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler( async (req,res) => {
    const {playlistId,videoId} = req.params
    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlistId or videoId")
    }

    const userId = req.user._id

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {_id : playlistId , owner : userId},
        {$pull : {videos : videoId}},//what to use here to remove video with videoId from videos??
        {new : true , runValidators : true}
    ).populate("videos" , "title _id")

    if(!updatedPlaylist){
        //either playlist doesn't exist or it's unauthorised 
        throw new ApiError(404,"either playlist doesn't exist or unauthorised request")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler( async (req,res)=>{
    const {playlistId} = req.params
    const userId = req.user._id;
    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid palylistId")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({_id : playlistId , owner : userId})

    if(!deletedPlaylist){
        throw new ApiError(404,"playlist doesn't exit or unauthorised request")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedPlaylist,"playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    // validate playlistId
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    // build update object dynamically
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: userId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist doesn't exist or unauthorized request");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

