import { Router } from "express";
import { createRole, getRoles } from "../controllers/roleController";
import { publicMiddleware } from "../middleware/publicMiddleware";

const router = Router();

router.post("/", createRole);
router.get("/", publicMiddleware, getRoles); // Make getRoles public

export default router;