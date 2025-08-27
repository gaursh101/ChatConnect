import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertTypingSchema } from "@shared/schema";
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

  // Update typing status
  app.post("/api/typing", async (req, res) => {
    try {
      const validatedData = insertTypingSchema.parse(req.body);
      
      if (!validatedData.username.trim()) {
        return res.status(400).json({ message: "Username is required" });
      }

      const typingStatus = await storage.updateTypingStatus(validatedData);
      res.status(200).json(typingStatus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid typing data" });
      }
      res.status(500).json({ message: "Failed to update typing status" });
    }
  });

  // Get active typing users
  app.get("/api/typing", async (req, res) => {
    try {
      const excludeUsername = req.query.exclude as string;
      const activeUsers = await storage.getActiveTypingUsers(excludeUsername);
      res.json({ typingUsers: activeUsers });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch typing users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
