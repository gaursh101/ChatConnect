import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      
      if (!validatedData.content.trim()) {
        return res.status(400).json({ message: "Message content cannot be empty" });
      }

      if (validatedData.content.length > 500) {
        return res.status(400).json({ message: "Message too long" });
      }

      if (!validatedData.username.trim()) {
        return res.status(400).json({ message: "Username is required" });
      }

      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
