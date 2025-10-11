import { Router } from "express"
const router = Router()
import {
    getChannelStats,
    getChannelVideos
} from '../controllers/dashboard.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js"

//route for getChannelStats
//we have to use get request 
//we have to be the owner to get the channel stats 
router.route("/stats").get(verifyJWT,getChannelStats)

//route for getChannelVideos
//here we don't have to be the owener to get the channel videos 
//and we don't even need to be logged in to get some channels videos 
//but since this is the channel dashboard , user want to get all his channel 
//videos right so here the user should be logged in 
router.route("/videos").get(verifyJWT,getChannelVideos)

export default router