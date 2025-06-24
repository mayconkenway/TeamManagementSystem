import {
  users,
  calendarEvents,
  noticeTypes,
  noticeTags,
  notices,
  chatMessages,
  dailyTracking,
  chatSettings,
  appSettings,
  type User,
  type InsertUser,
  type CalendarEvent,
  type InsertCalendarEvent,
  type NoticeType,
  type InsertNoticeType,
  type NoticeTag,
  type InsertNoticeTag,
  type Notice,
  type InsertNotice,
  type ChatMessage,
  type InsertChatMessage,
  type DailyTracking,
  type InsertDailyTracking,
  type ChatSettings,
  type AppSettings,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Calendar operations
  getCalendarEvents(userId?: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;
  
  // Notice operations
  getNoticeTypes(): Promise<NoticeType[]>;
  createNoticeType(type: InsertNoticeType): Promise<NoticeType>;
  deleteNoticeType(id: string): Promise<void>;
  
  getNoticeTags(): Promise<NoticeTag[]>;
  createNoticeTag(tag: InsertNoticeTag): Promise<NoticeTag>;
  deleteNoticeTag(id: string): Promise<void>;
  
  getNotices(): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: string, updates: Partial<Notice>): Promise<Notice>;
  deleteNotice(id: string): Promise<void>;
  
  // Chat operations
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessage(id: string, updates: Partial<ChatMessage>): Promise<ChatMessage>;
  deleteChatMessage(id: string): Promise<void>;
  getChatSettings(): Promise<ChatSettings>;
  updateChatSettings(settings: Partial<ChatSettings>): Promise<ChatSettings>;
  
  // Daily tracking operations
  getDailyTracking(date?: string): Promise<DailyTracking[]>;
  createDailyTracking(tracking: InsertDailyTracking): Promise<DailyTracking>;
  updateDailyTracking(id: string, updates: Partial<DailyTracking>): Promise<DailyTracking>;
  
  // App settings
  getAppSettings(): Promise<AppSettings>;
  updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id: crypto.randomUUID(),
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // Calendar operations
  async getCalendarEvents(userId?: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents);
  }

  async createCalendarEvent(eventData: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db
      .insert(calendarEvents)
      .values({
        ...eventData,
        id: crypto.randomUUID(),
      })
      .returning();
    return event;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const [event] = await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, id))
      .returning();
    return event;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Notice operations
  async getNoticeTypes(): Promise<NoticeType[]> {
    return await db.select().from(noticeTypes);
  }

  async createNoticeType(typeData: InsertNoticeType): Promise<NoticeType> {
    const [type] = await db
      .insert(noticeTypes)
      .values({
        ...typeData,
        id: crypto.randomUUID(),
      })
      .returning();
    return type;
  }

  async deleteNoticeType(id: string): Promise<void> {
    await db.delete(noticeTypes).where(eq(noticeTypes.id, id));
  }

  async getNoticeTags(): Promise<NoticeTag[]> {
    return await db.select().from(noticeTags);
  }

  async createNoticeTag(tagData: InsertNoticeTag): Promise<NoticeTag> {
    const [tag] = await db
      .insert(noticeTags)
      .values({
        ...tagData,
        id: crypto.randomUUID(),
      })
      .returning();
    return tag;
  }

  async deleteNoticeTag(id: string): Promise<void> {
    await db.delete(noticeTags).where(eq(noticeTags.id, id));
  }

  async getNotices(): Promise<Notice[]> {
    return await db.select().from(notices).where(eq(notices.isActive, true)).orderBy(desc(notices.createdAt));
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const [notice] = await db
      .insert(notices)
      .values({
        ...noticeData,
        id: crypto.randomUUID(),
      })
      .returning();
    return notice;
  }

  async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice> {
    const [notice] = await db
      .update(notices)
      .set(updates)
      .where(eq(notices.id, id))
      .returning();
    return notice;
  }

  async deleteNotice(id: string): Promise<void> {
    await db.update(notices).set({ isActive: false }).where(eq(notices.id, id));
  }

  // Chat operations
  async getChatMessages(limit = 100): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...messageData,
        id: crypto.randomUUID(),
      })
      .returning();
    return message;
  }

  async updateChatMessage(id: string, updates: Partial<ChatMessage>): Promise<ChatMessage> {
    const [message] = await db
      .update(chatMessages)
      .set({ ...updates, isEdited: true, updatedAt: new Date() })
      .where(eq(chatMessages.id, id))
      .returning();
    return message;
  }

  async deleteChatMessage(id: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  }

  async getChatSettings(): Promise<ChatSettings> {
    const [settings] = await db.select().from(chatSettings).where(eq(chatSettings.id, "main"));
    if (!settings) {
      const [newSettings] = await db
        .insert(chatSettings)
        .values({ id: "main" })
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateChatSettings(settingsData: Partial<ChatSettings>): Promise<ChatSettings> {
    const [settings] = await db
      .update(chatSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(chatSettings.id, "main"))
      .returning();
    return settings;
  }

  // Daily tracking operations
  async getDailyTracking(date?: string): Promise<DailyTracking[]> {
    if (date) {
      return await db.select().from(dailyTracking).where(eq(dailyTracking.date, date));
    }
    return await db.select().from(dailyTracking).orderBy(desc(dailyTracking.date));
  }

  async createDailyTracking(trackingData: InsertDailyTracking): Promise<DailyTracking> {
    const [tracking] = await db
      .insert(dailyTracking)
      .values({
        ...trackingData,
        id: crypto.randomUUID(),
      })
      .returning();
    return tracking;
  }

  async updateDailyTracking(id: string, updates: Partial<DailyTracking>): Promise<DailyTracking> {
    const [tracking] = await db
      .update(dailyTracking)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dailyTracking.id, id))
      .returning();
    return tracking;
  }

  // App settings
  async getAppSettings(): Promise<AppSettings> {
    const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, "main"));
    if (!settings) {
      const [newSettings] = await db
        .insert(appSettings)
        .values({ id: "main" })
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateAppSettings(settingsData: Partial<AppSettings>): Promise<AppSettings> {
    const [settings] = await db
      .update(appSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(appSettings.id, "main"))
      .returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();