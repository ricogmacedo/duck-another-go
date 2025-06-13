import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 300,
  duckDuckGoApiBaseUrl: process.env.DUCKDUCKGO_API_BASE_URL || "https://api.duckduckgo.com",
}