import express from "express";
import { submitApplication, getApplicationsByUser,getApplicationById,hasUserAppliedForRole } from "../controllers/applicationController";
import { fileValidator } from "../middleware/applicationMiddleware";

const router = express.Router();

// Route to submit an application with a PDF resume
router.post("/submit", fileValidator, submitApplication);
router.post("/:id", getApplicationById);

// Route to get applications by a specific user
router.get("/user/:userId", getApplicationsByUser);
router.get("/check/:username/:rolePostId", hasUserAppliedForRole);

export default router;
