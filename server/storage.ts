import { type User, type InsertUser, type Message, type InsertMessage, type TypingStatus, type InsertTypingStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateTypingStatus(typingStatus: InsertTypingStatus): Promise<TypingStatus>;
  getActiveTypingUsers(excludeUsername?: string): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Message[];
  private typingUsers: Map<string, TypingStatus>;

  constructor() {
    this.users = new Map();
    this.messages = [];
    this.typingUsers = new Map();
    
    // Clean up old typing status every 10 seconds
    setInterval(() => {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 5000); // 5 seconds ago
      
      for (const [username, status] of Array.from(this.typingUsers.entries())) {
        if (new Date(status.lastTyping) < cutoff) {
          this.typingUsers.delete(username);
        }
      }
    }, 10000);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return [...this.messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.messages.push(message);
    return message;
  }

  async updateTypingStatus(insertTypingStatus: InsertTypingStatus): Promise<TypingStatus> {
    const existingStatus = this.typingUsers.get(insertTypingStatus.username);
    
    const typingStatus: TypingStatus = {
      id: existingStatus?.id || randomUUID(),
      username: insertTypingStatus.username,
      lastTyping: new Date()
    };
    
    this.typingUsers.set(insertTypingStatus.username, typingStatus);
    return typingStatus;
  }

  async getActiveTypingUsers(excludeUsername?: string): Promise<string[]> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 3000); // 3 seconds ago
    
    const activeUsers: string[] = [];
    
    for (const [username, status] of Array.from(this.typingUsers.entries())) {
      if (new Date(status.lastTyping) >= cutoff && username !== excludeUsername) {
        activeUsers.push(username);
      }
    }
    
    return activeUsers;
  }
}

export const storage = new MemStorage();
