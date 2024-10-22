import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import { connectDB } from "./config/db";
import { sessionMiddleware } from "./middleware/sessionMiddleware";
import "./services/passportSetup"; // Ensure passport is configured
import authRoutes from "./routes/authRoutes";
import roleRoutes from "./routes/roleRoutes";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
}));

// Session and Passport setup
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/roles", roleRoutes);

export default app;
