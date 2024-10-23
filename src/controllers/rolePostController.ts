import { Request, Response } from "express";
import { rolePostCollection } from "../config/db";
import { ObjectId } from "mongodb";

export const getAllRolePosts = async (req: Request, res: Response) => {
  try {
    // Get page and filter parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Extract filtering parameters from the query
    const { userId, techStack, roles } = req.query;

    // Create a filter object based on parameters
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (techStack) filter.techStack = { $in: (techStack as string).split(",") };
    if (roles) filter.roles = { $in: (roles as string).split(",") };

    // Fetch role posts with pagination and filtering
    const rolePosts = await rolePostCollection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform the data as required
    const response = rolePosts.map(({ _id, userId, techPublic, techStack, roles }) => ({
      id: _id,
      userId,
      ...(techPublic ? { technologies: techStack } : {}),
      roles,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching role posts:", err);
    res.status(500).json({ error: "Failed to fetch role posts" });
  }
};



export const getRolePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const rolePost = await rolePostCollection.findOne({ _id: new ObjectId(id) });

    if (!rolePost) {
      return res.status(404).json({ error: "Role post not found" });
    }

    const { _id, userId, repoLink, description, techPublic, techStack, roles } = rolePost;
    const response = {
      id: _id,
      userId,
      ...(techPublic ? { technologies: techStack } : {}),
      roles,
      repoLink,
      description,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching role post:", err);
    res.status(500).json({ error: "Failed to fetch role post" });
  }
};