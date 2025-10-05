//what deos this contains
//same toggle subsription 
//subsciberlist of a channel
//list of the channel we have subsribed

import mongoose from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Subscription} from "../models/subscription.model.js"
import {User} from "../models/user.model.js"

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    const userId = req.user._id

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid ChannelId")
    }

    //it's a valid channel id but 
    //we have to check if the channel is present or not 
    //channel is onetype of user so we have to check in users

    const channelEntry = await User.findById(channelId)

    if(!channelEntry){
        throw new ApiError(404,"channel not found")
    }

    if(userId.toString() === channelId.toString()){
        throw new ApiError(400,"You can't subscribe to you own channel ")
    }

    const subscriptionEntry = await Subscription.findOne({channel : channelId , subscriber : userId})

    
    if(!subscriptionEntry){
        //currently not subsribed so we have to create an entry
        const newSubscriptionEntry = await Subscription.create({channel : channelId , subscriber : userId});
        if(!newSubscriptionEntry){
            throw new ApiError(500,"something went wrong")
        }
        return res
        .status(201)
        .json(new ApiResponse(201,newSubscriptionEntry,"Subscribed to the channel successfully"))
        //here instead of sending the document of the entry we can send {subscribed  : true}
        //simmilary below 
    }
    else{
        const removedEntry = await subscriptionEntry.deleteOne()
        
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Unsubscribed to the channel successfully"))
    }

})

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    //how to get channel subs all subs of a channel 
    //inorder find no of subs we have to find all the entries with channelId = curid
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channelId")
    }

    if(channelId.toString() !== req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to view this page")
    }

    const channelEntry = await User.findById(channelId)
    if(!channelEntry){
        throw new ApiError(404,"channel not found")
    }

    const subscriberList = await Subscription.find({channel : channelId}).populate("subsriber","username avatar")
    
    return res
    .status(200)
    .json(new ApiResponse(200,subscriberList,"subscriberList fetched successfully"))
    //here also can anyone see all the subsribers of any channel ?
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params
    //only user himself can see the list of all channels he subsribes ??
    //or any usercan see the channels subscribed by others??
    
    //according to this code any user can see anyother users data ?? isn't it 

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriberId")
    }

    if(subscriberId.toString() !== req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to view this page")
    }

    const subscriberEntry = await User.findById(subscriberId)
    if(!subscriberEntry){
        throw new ApiError(404,"subscriber not found or user not found")
    }

    const subscribedChannelsList = await Subscription.find({subscriber : subscriberId}).populate("channel","username fullName avatar")
    
    return res
    .status(200)
    .json(new ApiResponse(200,subscribedChannelsList,"subscribedChannelsList fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}