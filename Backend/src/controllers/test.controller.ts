import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const testingController = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }
    const data = req.user
    console.log(data);
    return res
        .status(200)
        .json(new ApiResponse(200, { data }, "Access Token Refreshed"));
})

export {
    testingController
}