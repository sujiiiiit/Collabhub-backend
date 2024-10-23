import { Router } from "express";
import passport from "passport";
import { getUser, logoutUser, fetchUserRepos } from "../controllers/authController";

const router = Router();

router.get("/github", passport.authenticate("github"));
router.get("/github/callback", passport.authenticate("github", {
  failureRedirect: "/login",
  successRedirect: process.env.CLIENT_URL,
}));

router.get("/user", getUser);
router.post("/logout", logoutUser);
router.get("/github/repos", fetchUserRepos);


export default router;
