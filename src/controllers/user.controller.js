import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>
{//here why we haven't used async handler function 
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        //while saving we need password but here we don't have any 
        //how to bipass this verificatioon step ie how to save without pass 
        await user.save({validateBeforeSave : false})
        return {accessToken , refreshToken}
    }
    catch(error){
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
    // res.status(200).json(
    //     {
    //         message : "chai aur code"
    //     }
    // )
    //get user details from frontend
    //validation on backend  - like it is empty or not
    //check if user already exists : both user name & email
    //we are taking a file or not 
    //in avathar we need file 
    //in background we don't need
    //upload them to cloudinary - from that we will get a resp and we will take a url from the returned value 
    //create an object for db - and create an entry in db

    const {fullName,email,username,password} =  req.body 
    // console.log("email : ",email);
    // i thougtht we have to keep () after body

    //before verification we have to get the files also 
    //how can we do this 
    //by using multer 
    //how to use multer
    //we have to use multer as middleware 
    //we have used multer as middleware so we will get files from the input 

    //now we have to verify every data came or not 
    //all fields or empty or not 
    //i can write if else but how can i do this neatly
    //we can use arr.some method 
    //this will call the predicate function ie which we pass inside this method 
    //on every element in the arr until the predicate function return a true value
    //or until the end of the array 

    if(
        [fullName,email,username,password].some((feild)=>{
            return (feild?.trim() === "");
            //we are not doing this directly like feild === "" 
            //this because feild may be equals to "    " so we will trim the feild 
        })
    )
    {
        throw new ApiError(400,"All fields are required")
    }

    //now we have to check if the user is already present in the db or not
    //this can be done by User model
    //we can do this by using username or by email 
    //what is the syntax we can write findOne() two time 
    //but we can use $(somebitwise operation) to check by any no of entries
    const existedUser =await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with username or email already exists")
    }

    //now we have to handle images ie files 
    //we have to get filepath from multer and give that to the cloudinary utility 
    //since we have used multer as middleware we can access req.files 
    //if present 

    //in files which is being uploaded in avatar feild in the input form 
    //we will get many values like type , size and etc etc 
    //among those avatar[0] ie first value contains an object which will have the path 

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath =  req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && (req.files.coverImage.length >0)){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //now we have to upload this avatarLocalPath to the cloudinary 
    //when we cleary observe one thing in cloudinary in case of failure we are deleting the file 
    //but not in the case of successfull 
    // but we need to remove this we will do this later 

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //now we have uploaded but we have to make sure that the file is uploaded in the cloudinary

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
        //but this the error of the cloudingary right ??
        //avatar is not uploaded due to bad local path may be 
        //and also cloudinary issue
    }
    const user =  await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "" ,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )

})

const loginUser = asyncHandler( async (req,res)=>{
    //get data from the req ie from frontend
    const {username,email,password} = req.body
    //check if all feilds are present or not 
    if(!username && !email){
        throw new ApiError(400,"Enter username or email")
    }
    if(!password){
        throw new ApiError(400,"Enter your password")
    }
    //check if there is any entry with the username or email id
    const user = await User.findOne(
        {$or : [{username},{email}]}
    )
    //if there is no entry with this email or username 
    //we have to redirect to the registerUser page ???
    if(!user){
        throw new ApiError(404,"user does not exist")
    }
    //now check if the password is correct this can be done by 
    //the check password function in usermodel
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404,"Invalid user credentials")
    }
    //now generate access and refresh token using the functions in usermodel
    const{accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
    //now we have to send these in the cookies 
    //what info we have to sent the user 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    //now we have required details of user and we want to send cookies
    //we can do this by using .cookie in cookie parser 
    //what are the inputs for that method 

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in seccessfully"
        )
    )
    //cookies are not set in the mobile applications ??

})

//now how to logout 
//clearing out tokens ie removing tokens from the webbrowser ans also from the 
//logout mean taking access from the user
//now how to get the userid to logout ie clear the tokens from the db ???
//from req we will get usename email and pass ?? no ig 
//but what does the req contians?
//we can use .cookie since we have user cookie middleware 

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            },
        },
        {
            new : true
            //when we say this we will the updated value in the response 
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken : newRefreshToken
                },
                "Access token refreshed"
    
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
    
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword} = req.body
    //we are calling this controller that means we are already logged in 
    //that means auth middleware added user 

    const user = await User.findById(req.user?._id)
    // const user = req.user;

    //why this is giving wrong results 
    //does req.user doesn't have whole user model ??

    //this will just give us the user 
    //does that means it only contains name since user is a schema it contains a;
    //but we need to access 
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})//here we are using this since we are already logged in 
    //what we should do in case of findbyindandupdate ??
    return res
})
const getCurrentUser = asyncHandler( async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "Current user fetched successfully"
    ))

} )
const updateAccountDetails = asyncHandler( (req,res)=>{
    const {fullName,email} = req.body
    if(!fullName || !email){
        throw new ApiError(400,"All feilds are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler( async (req,res)=>{
    const avatarLocalPath =  req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while updating on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar image updated successfully"))
})

const updateUserCoverImage = asyncHandler( async (req,res)=>{
    const coverImageLocalPath =  req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverimage file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while updating on coverimage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image updated successfully"))
})

export {registerUser , 
        loginUser , 
        logoutUser , 
        refreshAccessToken, 
        changeCurrentPassword , 
        getCurrentUser ,
        updateAccountDetails ,
        updateUserAvatar ,
        updateUserCoverImage
    }