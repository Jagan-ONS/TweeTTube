//add a comment 
//delete a comment 
//edit a comment 
//we can also like the comment ans but will this be written in like controller ??
// we can also reply for comments

import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async(req,res)=>{
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    //page - which page we want 
    //limit - how many no of documents 1 page should contains 
    //is we want 2nd page we have to skip first page 
    //that means we have to skip (page-1)*limit no of doucuments
    //req.query values are strings so we have to convert them into integers

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const pageNum = Math.max(1,parseInt(page))
    const limitLem = Math.max(1,parseInt(limit))
    //we can use parseInt to convert string into int 
    //what skip does is it mentions what is the no of 
    //documents to skip but how do we know no of documents
    //we have to skip 
    // const comments = await Comment.find({video : videoId})
    //                               .sort({createdAt : -1})
    //                               .skip((pageNum-1)*limitLem)
    //                               .limit(limitLem)
    // // if(comments.length === 0){
    // //     throw new ApiError(404,"No Comments or invalid videoId")
    // // }
    //const totalComments = await Comment.countDocuments({video : videoId})
    //since comments and totalComments are indipendent
    //we can use promiss all it will reduce db latendcy by 50 %
    
    const [comments , totalComments] = await Promise.all(
        [
            Comment.find({video : videoId})
                   .sort({createdAt : -1})
                   .skip((pageNum-1)*limitLem)
                   .limit(limitLem),
            Comment.countDocuments({video : videoId})
        ]
    )

    //we can use .find({},{projections}) to get only wanted things in a doc instead of whole doc

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                comments,
                totalComments,
                currentPage:pageNum,
                totalPages:Math.ceil(totalComments/limitLem)
            },
            "Fetched all video comments successfully")
        )
})

const addComment = asyncHandler(async(req,res)=>{
    //we will get the userId , videoId, content 
    //who is commenting 
    //under which comment he is commenting
    //and what he is commneting 
    //we will get these in body

    //do we get userid through .user 
    //does the uset needs to login to comment yes 
    //so while verification .user will be added to the req
    // console.log(req);
    const {videoId}  = req.params
    const content = req.body.content?.trim();
    const userId = req.user._id

    //check if videoId is valid 
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid VideId")
    }
    //here we have to check if the user is logged in or not right ??
    if(content === ""){
        throw new ApiError(400,"Content can't be empty")
    }

    const comment = await Comment.create({
        content : content,
        video : videoId,
        owner : userId
    })
    if(!comment){
        throw new ApiError(500,"something went wrong ,comment not added")
    }
    return res
    .status(201)
    .json(new ApiResponse(201,comment,"comment added successfully"))
})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const content = req.body.content?.trim()||""
    const userId = req.user._id
    //do we have to check if commentId is valid or not 
    //or should we assume that the frontend guy will make sure that 
    //the provided id is valid 

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid commentId")
    }

    if(content === ""){
        throw new ApiError(400,"content can't be empty")
    }

    const comment = await Comment.findOneAndUpdate(
        {_id : commentId , owner : userId},
        {
            $set : {
                content : content
            }
        },
        {
            new : true,//why do we use this we don't want new one right ?? we just need to update 
            //it doesn't create a new one it just tells the mongoose to return the updated one 
            // instead of old one without this comment will have old comment but in db new one will
            //be there 
            runValidators : true//this make sure that intigrity of the db isn't compromised 
        }
    )

    if(!comment){
        throw new ApiError(404,"Comment not found or unauthorised request")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,comment,"comment updated successfully"))

})

const deleteComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params
    const userId = req.user._id

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid commentId")
    }

    const comment = await Comment.findOneAndDelete({_id : commentId , owner : userId});
    //what will findoneanddelete will return 
    //if there is a comment with commentId and userId then it will return that and delete or  
    //it will return something else
    //okay it will first delete the comment and returns the deleted comment 
    if(!comment){
        throw new ApiError(404,"Comment not found or unauthorized request")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}