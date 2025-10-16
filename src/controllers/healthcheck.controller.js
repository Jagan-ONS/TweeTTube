// what does health check means ?? 
// what is the use of health check controller ?
// in the assignment it just said it should simply 
// returns the ok status as json with a message ??
// if this is what we do in this controller 
// what happens when we click /healthcheck 
// this will gives the ok status with some response 
// what is the use of this ??? 
// why do we need this controller 

// this is to know whether the server is alive or not 
// this is the first thing we check when our app isn't 
// responding 

// now how to write this 

import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler( async(req,res)=>{
    return res
    .status(200)
    .json({"status" : "ok","message" : "Server is running"})
})

export {healthcheck}