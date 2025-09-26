import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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

    const {fullname,email,username,password} =  req.body 
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
        [fullname,email,username,password].some((feild)=>{
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
    const existedUser = User.findOne({
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
    const coverImageLocalPath =  req.files?.coverImage[0]?.path

    if(avatarLocalPath){
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
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
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

export {registerUser}