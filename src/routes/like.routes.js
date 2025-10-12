import { Router } from "express"
const router = Router()

import {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getAllLikedVideos,
    getLikeCountOfComment,
    getLikeCountOfTweet,
    getLikeCountOfVideo
} from "../controllers/like.controller.js"

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/videos").get(getAllLikedVideos)
router.route("/like-count/v/:videoId").get(getLikeCountOfVideo)
router.route("/like-count/c/:commentId").get(getLikeCountOfComment)
router.route("/like-count/t/:tweetId").get(getLikeCountOfTweet)

export default router