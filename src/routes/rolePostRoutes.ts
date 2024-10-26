import { Router } from "express";
import { getAllRolePosts, getRolePostById,createRolePost } from "../controllers/rolePostController";
import { publicMiddleware } from "../middleware/publicMiddleware";

const router = Router();

router.get("/", publicMiddleware, getAllRolePosts); // Make getAllRolePosts public
router.get("/:id", getRolePostById);
router.post("/", createRolePost);


export default router;