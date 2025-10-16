import { Router } from "express";
const router = Router();

import { 
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
 } from "../controllers/comment.controller.js";

 import { verifyJWT } from "../middlewares/auth.middleware.js";
//now we want to get all comments of a video
//we don't have to be the owner of that video to get the comments so verifyJWT is 
//not required 

//now videoId comes as params and limit and page comes as query params 
//how to add these 
//we can add the video like this /c/:videoId
//but how can we add query params ???
//so we don't have to mention in the route 
//we can directly send then when requires 

router.use(verifyJWT)

router.route("/:videoId").get(getVideoComments).post(addComment)

//there are no query paramenter 
//we have to get the required values from the body
//and we will be able to add a comment only when we are logged in 
//so we need verifyJWT
// router.route("/add-comment").post(verifyJWT,addComment)

//here are also we are using req.user._id 
//because we have to be the owener of the comment to update it 
//and the remining will comes as body 
// router.route("/update-comment").patch(verifyJWT,updateComment)

//same as above we use verifyJWt
// router.route("/delete-comment").delete(verifyJWT,deleteComment)

router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router