import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoles = ["admin", "lider", "colaborador"] as const;
export type UserRole = (typeof userRoles)[number];

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: varchar("role", { enum: userRoles }).notNull().default("colaborador"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar events
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  type: varchar("type", { enum: ["lembrete", "folga", "treinamento"] }).notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").array(), // For specific users or null for all
  isAllUsers: boolean("is_all_users").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notice types
export const noticeTypes = pgTable("notice_types", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull().unique(),
  color: varchar("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notice tags
export const noticeTags = pgTable("notice_tags", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull().unique(),
  color: varchar("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notices
export const notices = pgTable("notices", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  typeId: varchar("type_id").notNull().references(() => noticeTypes.id),
  tags: varchar("tags").array().default([]),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  deadline: timestamp("deadline"),
  renewalDate: timestamp("renewal_date"),
  isActive: boolean("is_active").default(true),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().notNull(),
  content: text("content").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { enum: ["text", "emoji", "image", "priority"] }).notNull().default("text"),
  imageUrl: varchar("image_url"),
  isPriority: boolean("is_priority").default(false),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily tracking
export const dailyTracking = pgTable("daily_tracking", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  status: varchar("status", { enum: ["trabalhou", "atestado", "ferias"] }).notNull(),
  weeklyAttendances: integer("weekly_attendances").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat settings
export const chatSettings = pgTable("chat_settings", {
  id: varchar("id").primaryKey().notNull().default("main"),
  isPaused: boolean("is_paused").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// App settings
export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().notNull().default("main"),
  darkMode: boolean("dark_mode").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
});

export const insertNoticeTypeSchema = createInsertSchema(noticeTypes).omit({
  id: true,
  createdAt: true,
});

export const insertNoticeTagSchema = createInsertSchema(noticeTags).omit({
  id: true,
  createdAt: true,
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyTrackingSchema = createInsertSchema(dailyTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type NoticeType = typeof noticeTypes.$inferSelect;
export type InsertNoticeType = z.infer<typeof insertNoticeTypeSchema>;

export type NoticeTag = typeof noticeTags.$inferSelect;
export type InsertNoticeTag = z.infer<typeof insertNoticeTagSchema>;

export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type DailyTracking = typeof dailyTracking.$inferSelect;
export type InsertDailyTracking = z.infer<typeof insertDailyTrackingSchema>;

export type ChatSettings = typeof chatSettings.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;