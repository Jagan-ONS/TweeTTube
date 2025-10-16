//what does yt dashboard contains 
//total videos , total subscribers , total videos , total likes 
//we need to get all the videos uploades by the users 

import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";

const getChannelStats = asyncHandler(async(req,res)=>{
    //what does req usually contains ?? when we wnat channel stats 
    //userid that's it 
    const userId = req.user._id
    // const videos = await Video.find({owner : userId})
    // const subscribersCount = await Subscription.countDocuments({channel : userId})

    // const viewsAggregation = await Video.aggregate([
    //     {
    //         $match : {
    //             owner : userId
    //         }
    //     },
    //     //{ $group: { _id: null, totalViews: { $sum: "$views" } } }
    //     {
    //         $group : {
    //             _id : null,
    //             totalViews : { $sum : "$views"}
    //         }
    //     }
    // ])

    // const totalViews = viewsAggregation[0]?.totalViews || 0

    // const likesAggregation = await Like.aggregate([
    //     {
    //         $match : {
    //             video : {$in : videos.map(v => v._id)}
    //         }
    //     },
    //     {
    //         $group : {
    //             _id : null,
    //             totalLikes : {$sum : 1}
    //         }
    //     }
    // ])

    // const totalLikes = likesAggregation[0]?.totalLikes || 0


    // return res
    // .status(200)
    // .json(new ApiResponse(
    //     200,
    //     {
    //         totalVideos : videos.length,
    //         totalLikes,
    //         totalViews,
    //         subscribersCount
    //     },
    //     "channel stats fetched successfully"
    // ))

    const stats = await Video.aggregate([
        {
            $match : {
                owner : userId
            }
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "video",
                as : "likes"
            }
        },
        {
            $group : {
                _id : null,//don't group by any thing just assume whole collection as a group 
                totalVideos : {$sum : 1},
                totalViews : {$sum : "$views"},
                totalLikes : {$sum : {$size : "$likes"}}

            }
        }
    ]) 
    
    const channelStats = {
        totalVideos : stats[0]?.totalVideos || 0,
        totalViews : stats[0]?.totalViews || 0,
        totalLikes : stats[0]?.totalLikes || 0,
        totalSubscribers : await Subscription.countDocuments({channel : userId})
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channelStats,"channel Stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async(req,res)=>{
    //here i assume we bring a few pages at a time 
    //since there may be many videos it's not okay to bring them all at a time 
    const userId = req.user._id
    const {page = 1 , limit = 10} = req.query 

    const pageNum = Math.max(1,parseInt(page))
    const limitNum = Math.max(1,parseInt(limit))

    const videos = await Video.find({owner : userId})
                        .sort({createdAt : -1})
                        .skip((pageNum - 1)*limitNum)
                        .limit(limitNum)

    const totalVideos = await Video.countDocuments({owner : userId})

    //here we can use promise all also 

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            videos,
            totalVideos : totalVideos,
            currentPage : pageNum,
            totalPages : Math.ceil(totalVideos/limitNum)
        },
        "Videos fetched successfully"
    ))
})

export {
    getChannelStats,
    getChannelVideos
}