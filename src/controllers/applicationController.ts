import { Request, Response } from "express";
import { applicationCollection } from "../config/db"; // Assuming applicationCollection is initialized
import { format } from "date-fns";
import { ObjectId } from "mongodb";

// Route to submit an application
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { message, username, rolePostId } = req.body;
    const createdAt = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"); // Timestamp

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    const newApplication = {
      username: username,
      rolePostId: String(rolePostId),
      message,
      resume: {
        data: req.file.buffer.toString("base64"), // Convert binary file to base64 string
        contentType: req.file.mimetype, // Store the MIME type of the file
        filename: req.file.originalname, // Store the original filename
      },
      appliedOn: createdAt,
    };

    const result = await applicationCollection.insertOne(newApplication);

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId: result.insertedId,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get applications submitted by a user
export const getApplicationsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const applications = await applicationCollection
      .find({ userId })
      .project({ _id: 1, rolePostId: 1, message: 1, createdAt: 1 }) // Select fields as needed
      .toArray();

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await applicationCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

export const hasUserAppliedForRole = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, rolePostId } = req.params;

    const application = await applicationCollection.findOne({
      username: username,
      rolePostId: rolePostId,
    });
    if (application) {
      return res.status(200).json({ applied: true });
    } else {
      return res.status(404).json({ applied: false });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};
