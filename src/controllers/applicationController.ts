import { Request, Response } from "express";
import { applicationCollection } from "../config/db"; // Assuming applicationCollection is initialized
import { format } from "date-fns";

// Route to submit an application
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { message, userId, rolePostId } = req.body;
    const createdAt = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"); // Timestamp

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    const newApplication = {
      userId,
      rolePostId,
      message,
      resume: {
      data: req.file.buffer.toString('base64'), // Convert binary file to base64 string
      contentType: req.file.mimetype, // Store the MIME type of the file
      filename: req.file.originalname // Store the original filename
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
