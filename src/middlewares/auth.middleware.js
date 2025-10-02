//what does this middleware do ??
//this will check if the user is ther or not 

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//why do we have to verify jwt
//what does verifing jwt means  
//
export const verifyJWT = asyncHandler(async (req,res,next) =>
{
    try {
        //req has access to cookie 
        //when does this happened
        //we used cookieparser so it adds cookies the req 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        //why this "?" eventhogh we added those tokens in the login ??
        //these are not saved in mobile application >>
        //why ??
        
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Acess Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message||"invalide access token")
    }

    //we try to take the token from res either through cookies or header 
    //if there is no token at all that means cur req is unaut req the use who are trying to do this is 
    //not logged in or something like that explain clearly ??
    //let say token is found then we use verify to decode the token ?? this splits the token into 
    // payload and some other headers ??
    //this decoded token is an object or a document ??
    // explaint what does this do clearly 

})