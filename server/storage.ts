import { messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .orderBy(messages.timestamp);
    return result;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
