import { Router } from "express";
import { loginUser, logoutUser, registerUser , refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar", //this is the feild name in the frontend
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ])
    //we can't use array here because it takes multiple files 
    //in a single field 
    ,registerUser
)

router.route("/login").post(loginUser)

//secured routes 
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router
//there are two ways to export router 
//one is export { router}
//when we use this we will import this as an object in the other files
//and another one is const export router somehting like that 
//