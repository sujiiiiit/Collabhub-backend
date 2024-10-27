import express from "express";
import { submitApplication, getApplicationsByUser } from "../controllers/applicationController";
import { fileValidator } from "../middleware/applicationMiddleware";

const router = express.Router();

// Route to submit an application with a PDF resume
router.post("/submit", fileValidator, submitApplication);

// Route to get applications by a specific user
router.get("/user/:userId", getApplicationsByUser);

export default router;
