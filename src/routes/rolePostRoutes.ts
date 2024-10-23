import { Router } from "express";
import { getAllRolePosts, getRolePostById } from "../controllers/rolePostController";
import { publicMiddleware } from "../middleware/publicMiddleware";

const router = Router();

router.get("/", publicMiddleware, getAllRolePosts); // Make getAllRolePosts public
router.get("/:id", getRolePostById);

export default router;