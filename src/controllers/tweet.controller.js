

//create a new tweet 
//delete a tweet 
//show all tweets by a user 
//update a tweet 

import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.model.js"
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"

const createTweet = asyncHandler(async(req,res)=>{
    //do we have to verify jwt ???
    //yes ig 
    const content = req.body.content
    const owner = req.user._id

    content = content.trim()
    
    if(content === "" ){
        throw new ApiError(400,"content shouldn't be empty")
    }

    const tweet = await Tweet.create({
        content,
        owner
    })

    // const createdTweet = await Tweet.findById(tweet._id);
    if(!tweet){
        throw new ApiError(500,"Something went wrong , can't create a Tweet")//server error
    }
    return res
    .status(201)
    .json(new ApiResponse(201,tweet,"Tweet created successfully"))
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    const userId = req.user._id
    //first we will fetch the document and delete
    // const tweet = await Tweet.findById(tweetId)
    
    // if(!tweet){
    //     throw new ApiError(404,"tweet not found")
    // }
    // if(!tweet.owner.equals(userId)){
    //     throw new ApiError(403,"Unauthorised request")
    // }
    // await tweet.deleteOne();
    // //or we can use tweet.remove()
    // return res
    // .status(200)
    // .json(new ApiResponse(200,{},"Tweet deleted successfully"))
    const tweet = await Tweet.findOneAndDelete(
        {_id : tweetId, owner : userId}
    )
    if(!tweet){
        throw new ApiError(404,"Tweet not found or Unauthorized request")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet deleted successfully"))
})

const updateTweet = asyncHandler(async(req,res)=>{
    //get tweetid , updated dec , user id from the req body 
    const {tweetContent} = req.body
    const {tweetId} = req.params
    const userId = req.user._id
    // //can we add tweet info using another middleware 
    // //why ?? to use req.tweet._id , req.tweet.decpriton :)
    // //is this even possible 
    // //it this requited 

    // //now get the owner of the tweetId
    // const tweet = await Tweet.findById(tweetId);
    // if(!tweet){
    //     throw new ApiError(404,"tweet not found")
    // }
    // if(!tweet.owner.equals(userId)){
    //     throw new ApiError(401,"Unauthorized request")
    // }

    // //now how to update the descripiton of the tweet 
    // //again making db call like findByIdAndUpdate is bad 
    // //how can we do here 
    // //and in the routes we have to use patch since we are
    // //updating 
    // //since we are already logged and we are authorized to do
    // //this we can bipass the verification step 

    // tweet.content = tweetContent;
    // await tweet.save({validateBeforeSave : false})

    // return res
    // .status(200)
    // .json(new ApiResponse(200,tweet,"Tweet updated successfully..."))

    //one like with less db hits 
    const tweet = await Tweet.findOneAndUpdate(
        {_id : tweetId , owner : userId},//should i make this mongoose odbject id ?? --> filters
        {
            $set : {
                content : tweetContent
            }
        },
        {
            new : true,
            runValidators : true//check if required feilds are included and lenght is in the give range 
            //in .save operation mongoose does this operations manually before saving 
        }
    )
    if(!tweet){
        throw new ApiError(404,"Tweet not found or unauthorized")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"tweet updated successfully"))
})

const getUserTweets = asyncHandler(async(req,res)=>{
     
    // const username = req.params
    //okay params is an object so we have to destructure it to use 
    // instead of above we use 
    const {username} = req.params

    // const userId = await User.findOne({username : username})._id;
    // user name may be wrong so find one may give null so we have to handle it 
    const userId = await User.findOne({username})?._id

    if(!userId){
        throw new ApiError(404,"user not found")
        //404 for user not found 
    }
    //asking to show the latest tweet first and soo on 
    // const tweets = await Tweet.find({owner : userId},{createdAt : -1})
    //here 2nd feild in find is the projections ie what we have to include or exclude 
    //ans we have to use .sort({createdAt : -1}) not inside find
    const tweets = await Tweet.find({owner : userId}).sort({createdAt : -1})

    
    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"user tweets fetched successfully"));

    //user aggreagations only when we need join and grouping 
    //if we want to select all documents satisfing some sondition we can use 
    //or if we want to match by id we 
    // const userId = req.user._id
    // const tweets = await Tweet.aggregate([
    //     {
    //         $match : {
    //             owner : new mongoose.Types.objectId(req.user._id)
    //         }
    //     },
    //     {
    //         $sort : {
    //             createdAt : -1
    //         }
    //     }
    // ])
    // return res
    // .status(200)
    // .json(new ApiResponse(200,tweets,"user tweets fetched successfully"))
    // using aggregations for just finding some documents which have sameproperty 

})

export {
    getUserTweets,
    updateTweet,
    deleteTweet,
    createTweet
}