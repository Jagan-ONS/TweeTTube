import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller";
const router = Router()

//we have to check if the server is connected and db is
//db is connected properly or not isn't it ??
//so we just need to do ??
//which request ??
//post request is the most sutable one 

router.route("/").get(healthcheck)

export default router