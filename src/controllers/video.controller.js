
//add a video
//delete a video
//update a video
//make it publish 
//toggle publish 
//get all videos
//get videoby id

import mongoose, { mongo } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



//paginated, sortable, and searchable API endpoint
const getAllVideos = asyncHandler(async(req,res)=>{
    const {page = 1,limit= 10,query,sortBy,sortType,userId} = req.query
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    //get all videos based on query sort pagination 
    //get all videos of some user 

    const filter = {};
    filter.owner = userId
    if(query){
        filter.$or = [
            {title : {$regex: query , $options: "i" }},
            {description : {$regex : query , $options : "i"}}
        ]
    }

    const sortOptions = {}

    if(sortBy){
        sortOptions[sortBy] = sortType==="desc"?-1:1
    }
    else{
        sortOptions.createdAt = -1
    }

    const videoCnt = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
                              .sort(sortOptions)  
                              .skip((pageNum-1)*limitNum)
                              .limit(limitNum)
                              
    //what does query mean
    //and how to user sortBy and sortType(asc or dsx)

    return res
    .status(200)
    .json(new ApiResponse(200,{
        videos,
        videoCnt,
        pageNum,
        limitNum,
        pageCnt :Math.ceil(videoCnt/limitNum)
    },"fetched videos successfully"))
})

const publishVideo = asyncHandler(async(req,res)=>{
    const {title , description} = req.body
    // let {title , description} = req.body
    // title = title.trim();
    // description = description.trim();
    // if(title==="" || description === ""){
    //     throw new ApiError(400,"title and description can't be empty")
    // }

    //when we keep some varibles as const we can't change them ie we can't 
    //assign new values to them 
    //but we can do this 

    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400,"title and description can't be empty")
    }

    //get video updload to cloudinary , create video
    //this means adding a video to the colletion 
    //what do we need to create a new doc
    //video file , thumnail , title ,description
    //duration , views , is published , owner 

    //duration from some cloudinary 
    //views is default 0 
    //ispublished default true
    //onwer is req.user._id

    const owner = req.user._id

    const localVideoFilePath = req.files?.videoFile[0]?.path;
    const localThumbnailPath = req.files?.thumbnail[0]?.path;

    if(!localVideoFilePath){
        throw new ApiError(400,"Video file is required")
    }
    if(!localThumbnailPath){
        throw new ApiError(400,"Thumbnail file is required")
    }

    const video = await uploadOnCloudinary(localVideoFilePath)
    const thumbnail = await uploadOnCloudinary(localThumbnailPath)

    if (!video?.url || !thumbnail?.url) {
        throw new ApiError(500, "Failed to upload video or thumbnail to Cloudinary");
    }

    //we have to get duraiton of video from cloudinary ??
    const videoDuration = video.duration

    //do we have to add any check for checking video and thumbnail came properly 
    //from cloudinary if yes , how to do that what if that uploading fail 
    //what type of data vide and thumbnail stores

    const newVideo = await Video.create({
        title : title.trim(),
        description : description.trim(),
        duration : videoDuration,
        owner : owner,
        videoFile : video?.url,
        thumbnail : thumbnail?.url
    })

    return res
    .status(200)
    .json(new ApiResponse(200,newVideo,"video published successfully"))
})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const video = await Video.findById(videoId).populate("owner" , "username")
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if (!video.isPublished && video.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this video");
    }


    return res
    .status(200)
    .json(new ApiResponse(200,video,"Fetched video successfully"))

})

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    //update video details like title , description , thumbnail
    const {title , description} = req.body
    //all feilds are not mandatory 
    //we will just update the feilds we want to update 

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const updateFeilds = {}
    if(title) updateFeilds.title = title
    if(description) updateFeilds.description = description

    
    // if(req.files){//whats wrong with this explain clearly
    //     const thumbnail = await uploadOnCloudinary(req.files.path)
        
    //     if(thumbnail){
    //         updateFeilds.thumbnail = thumbnail.url;
    //     }
    // }

    //above one is okay or do i have to do something like this 

    //do we have to use files or file explain clearly
    //while update there is only thumbnail which is file type 
    // let thumbnailLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && (req.files.coverImage.length >0)){
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

    //okay if we have multiple files we configure our update middleware ie multer as update.feilds
    //here we only have one file so we use update.single

    if(req.file){
        const thumbnail = await uploadOnCloudinary(req.file.path)
        
        if(thumbnail) updateFeilds.thumbnail = thumbnail.url
    }

    const video = await Video.findOneAndUpdate(
        { _id : videoId , owner : req.user._id},
        { $set : updateFeilds },
        {
            new : true,
            runValidators : true
        }
    )

    if(!video){
        throw new ApiError(404,"Video not found or unauthorized")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video updated successfully"))
    

})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const deletedVideo = await Video.findOneAndDelete({owner:mongoose.Types.ObjectId(req.user._id) , _id : videoId})

    if(!deletedVideo){
        throw new ApiError(404,"Video not found or unauthorized request")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully"))
    //we have to check we are the owner or not 
    // const video = await Video.findById(videoId)
    // if(!video){
    //     throw new ApiError(404,"video not found")
    // }
    // if(video.owner.toString() !== req.user._id.toString()){
    //     throw new ApiError(401,"You can't delete the video")
    // }


})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const video = await Video.findOne({owner : req.user._id , _id : videoId})

    if(!video){
        throw new ApiError(404,"Video not found or unauthorized request")
    }
    video.isPublished = !video.isPublished;
    
    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Publish status updatted successfully"))

    // const updatedPublicationStatus  = await Video.findOneAndUpdate(
    //     {owner:mongoose.Types.ObjectId(req.user._id) , _id : videoId},
    //     {
    //         $set : { isPublished : { $not : "$isPublished"} }
    //         //how to do this ?? we have to change the status is it's 0 we have to make it one  
    //     },
    //     {
    //         new : true,
    //         runValidators : true
    //     }
    // )

})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
