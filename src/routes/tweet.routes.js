import { Router } from "express"
const router = Router()
import {
    getUserTweets,
    updateTweet,
    deleteTweet,
    createTweet
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)
export default router