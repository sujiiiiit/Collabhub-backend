import { Request, Response } from "express";
import { rolePostCollection } from "../config/db";

export const createRole = async (req: Request, res: Response) => {
  try {
    const {
      pName,
      repoLink,
      techStack,
      techPublic,
      roles,
      address,
      description,
      duration,
      deadline,
      userId,
    } = req.body;

    const newRole = {
      pName,
      repoLink,
      techStack,
      techPublic,
      roles,
      address,
      description,
      duration,
      deadline,
      userId,
    };

    const result = await rolePostCollection.insertOne(newRole);

    res
      .status(201)
      .json({
        message: "Role created successfully",
        roleId: result.insertedId,
      });
  } catch (error) {
    console.error("Error inserting role:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await rolePostCollection.find({}).toArray();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
