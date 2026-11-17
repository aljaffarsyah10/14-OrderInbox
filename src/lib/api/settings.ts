/**
 * Settings API Client for OrderInbox
 * Handles user profile and alert configuration requests.
 */

import { apiClient } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
}

export interface UserSettings {
  id: string;
  userId: string;
  alertEmails: string[];
  webhookUrl: string | null;
  webhookEnabled: boolean;
  alertOnDown: boolean;
  alertOnRecovery: boolean;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsData {
  user: UserProfile;
  settings: UserSettings;
}

export interface UpdateSettingsPayload {
  name?: string;
  alertEmails?: string[];
  webhookUrl?: string | null;
  webhookEnabled?: boolean;
  alertOnDown?: boolean;
  alertOnRecovery?: boolean;
  consecutiveFailures?: number;
}

export async function getSettings(): Promise<SettingsData> {
  return apiClient.get<SettingsData>("/api/settings");
}

export async function updateSettings(
  payload: UpdateSettingsPayload
): Promise<SettingsData> {
  return apiClient.put<SettingsData>("/api/settings", payload);
}
