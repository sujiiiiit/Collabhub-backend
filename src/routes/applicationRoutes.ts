import express from "express";
import { submitApplication,getApplicationById,hasUserAppliedForRole,getApplicationsByRolePostId, getResume } from "../controllers/applicationController";
import { fileValidator } from "../middleware/applicationMiddleware";

const router = express.Router();

// Route to submit an application with a PDF resume
router.post("/submit", fileValidator, submitApplication);
router.get("/:id", getApplicationById);
router.get("/resume/:id", getResume);

// Route to get applications by a specific user
router.get("/check/:username/:rolePostId", hasUserAppliedForRole);
router.get("/rolepost/:rolePostId", getApplicationsByRolePostId);

export default router;
