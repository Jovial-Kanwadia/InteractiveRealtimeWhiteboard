import { Router } from "express";
import {
    testingController,
} from '../controllers/test.controller.js'
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/testing").get(verifyJWT, testingController);

export default router