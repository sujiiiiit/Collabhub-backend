import { Router } from "express";
import { getAllRolePosts, getRolePostById,createRolePost,getRolePostsByUserId } from "../controllers/rolePostController";
import { publicMiddleware } from "../middleware/publicMiddleware";

const router = Router();

router.get("/", publicMiddleware, getAllRolePosts); // Make getAllRolePosts public
router.get("/id/:id", getRolePostById);
router.post("/", createRolePost);
router.get("/user/:userId", getRolePostsByUserId);


export default router;