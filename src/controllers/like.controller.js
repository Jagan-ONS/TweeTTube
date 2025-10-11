//add a like to comment or a video 
//and a like 
//count no of likes for a video or for a comment
//give videos in the order or most liked ??
//this should be in video controller 

import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler( async(req,res)=>{
    //this means a video is liked 
    //then remove the like 
    //else add a like
    
    //in the req we will get 
    //video id and user id 
    //i there is no entry of these two in collection
    //then we add an entry 
    //if present we have to delete how can we delete
    //using findoneAndDelete

    const {videoId} = req.params;
    //here we don't take user id from req.body 
    //usually it is attached to req

    const userId = req.user._id;
    //user may try to like without loggin in 
    //we have to ask him to login inorder to like or sub or to take any action
    //what if the body of the req doesn't contains the userId feild 
    //but it should 
    //does it have any null value or it will get some error ???
    if(!userId){
        throw new ApiError(401,"Please login to like the video")
        //is this the correct status code 
        //404 if the resource we are trying to find doesn't exist 
        //401 unothorized if the user is not logged in 
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }
    //here we have to check if the videoId is valid or not 
    //since the 
    const videoEntry =await Video.findById(videoId)

    if(!videoEntry){
        throw new ApiError(404,"Video not found")
    }

    const likeEntry = await Like.findOne({video : videoId , likedBy : userId})
    if(!likeEntry){
        const newEntry = await Like.create({
            video : videoId,
            likedBy : userId
        })
        //what is the return type of .create 
        //does it returns new doc??
        //if yes i will store this and send it to user 
        return res
        .status(201)
        .json(new ApiResponse(201,newEntry,"Video liked successfully"))
    }
    else{
        // await Like.deleteOne({likeEntry}) --- this is wrong 
        //the deleteOne method expects feilds not a document 

        await Like.deleteOne({video : videoId , likedBy : userId})
        //we can also use likeEntry.deleteOne()
        //this looks simple 

        return res
        .status(200)
        .json(new ApiResponse(200,{liked : false},"Video Unliked Successfully"))
        //here do i have to use 204 status code 
        //but i want the message 
    }


})

const toggleCommentLike = asyncHandler( async(req,res)=>{
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Please login to like the comment")
    }

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const commentEntry = await Comment.findById(commentId);
    if (!commentEntry) {
        return res
        .status(404)
        .json(new ApiError(404, "Comment not found"));
    }

    const likeEntry = await Like.findOne({ comment: commentId, likedBy: userId });

    if (!likeEntry) {
        const newEntry = await Like.create({
            comment: commentId,
            likedBy: userId,
        });

        return res
        .status(201)
        .json(new ApiResponse(201, newEntry, "Comment liked successfully"));
    } else {
        await likeEntry.deleteOne();

        return res
        .status(200)
        .json(new ApiResponse(200, {liked : false}, "Comment unliked successfully"));
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Please login to like the tweet")
        
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    const tweetEntry = await Tweet.findById(tweetId);
    if (!tweetEntry) {
        throw new ApiError(404, "Tweet not found")
    }

    const likeEntry = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (!likeEntry) {
        const newEntry = await Like.create({
        tweet: tweetId,
        likedBy: userId,
        });

        return res
        .status(201)
        .json(new ApiResponse(201, newEntry , "Tweet liked successfully"));
    } else {
        await likeEntry.deleteOne();

        return res
        .status(200)
        .json(new ApiResponse(200, { liked: false }, "Tweet unliked successfully"));
    }
});


const getAllLikedVideos = asyncHandler( async(req,res) =>{
    const userId = req.user._id
    //he has to be logged in to view all his liked videos 
    //we are verifying and adding the user to req so he is already logged in 

    //find all the docs with the likedBy : userId
    //but this will give the liked comments also 
    //how to segregate videos from comments and tweets ?
    const likedVideos = await Like.find({likedBy : userId , video : {$ne : null}}).populate("video")

    return res
    .status(200)
    .json(new ApiResponse(200,likedVideos,"Fetched all liked videos successfully"))

})

const getLikeCountOfVideo = asyncHandler( async(req,res)=>{
    const {videoId} = req.params;

    //since videoId is coming from a client 
    //we have to chekc if the videoId is proper mongoose object id
    //and after that we have to check if there exist a video with that id at all 
    //or not ??

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const videoEntry = await Video.findById(videoId)

    if(!videoEntry){
        throw new ApiError(404,"Video not found")
    }

    const videoLikes = await Like.countDocuments({video : videoId})

    return res
    .status(200)
    .json(new ApiResponse(200,videoLikes,"fetched video likes"))
    //write some appropriate message above 
})

const getLikeCountOfComment = asyncHandler( async(req,res)=>{
    const {commentId} = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const commentEntry = await Comment.findById(commentId);
    if (!commentEntry) {
        throw new ApiError(404, "Comment not found")
    }

    const commentLikes = await Like.countDocuments({ comment: commentId });

    return res.status(200).json(new ApiResponse(200, commentLikes, "Total likes for this comment"));
})

const getLikeCountOfTweet = asyncHandler( async(req,res)=>{
    const tweetId = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    const tweetEntry = await Tweet.findById(tweetId);
    if (!tweetEntry) {
        throw new ApiError(404, "Tweet not found")
    }

    const tweetLikes = await Like.countDocuments({ tweet: tweetId });

    return res.status(200).json(new ApiResponse(200, tweetLikes, "Total likes for this tweet"));
})

export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getAllLikedVideos,
    getLikeCountOfComment,
    getLikeCountOfTweet,
    getLikeCountOfVideo
}



