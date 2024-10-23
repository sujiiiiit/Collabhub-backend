import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/userController";
import { publicMiddleware } from "../middleware/publicMiddleware";

const router = Router();

router.get("/", getAllUsers); // Make getAllUsers public
router.get("/:id",publicMiddleware, getUserById);

export default router;