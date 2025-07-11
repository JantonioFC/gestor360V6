import { apiRequest } from "./queryClient";

export interface GitSyncResult {
  message: string;
  timestamp: string;
  status: "success" | "error";
}

export class GitService {
  static async syncWithGit(): Promise<GitSyncResult> {
    try {
      const response = await apiRequest("POST", "/api/git/sync");
      return await response.json();
    } catch (error) {
      throw new Error("Failed to sync with Git");
    }
  }
}
