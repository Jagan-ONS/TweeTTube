import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
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
    ,registerUser)

export default router
//there are two ways to export router 
//one is export { router}
//when we use this we will import this as an object in the other files
//and another one is const export router somehting like that 
//