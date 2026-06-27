import ZAI from "z-ai-web-dev-sdk";
import fs from "fs/promises";
import path from "path";

const ZAI_CONFIG = {
  baseUrl: "https://internal-api.z.ai/v1",
  apiKey: "Z.ai",
  chatId: "chat-52fe90fa-b496-4650-a1ae-f6e0c83b3432",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTRjMmQxZTUtMDk5Yy00NmY3LTg3MGItN2FhNDVmYzEzYTE1IiwiY2hhdF9pZCI6ImNoYXQtNTJmZTkwZmEtYjQ5Ni00NjUwLWExYWUtZjZlMGM4M2IzNDMyIiwicGxhdGZvcm0iOiJ6YWkifQ.28FyeSKKYyB8T0GyMimYLx1oHvvj9OqZrI1e9OQZMYM",
  userId: "54c2d1e5-099c-46f7-870b-7aa45fc13a15",
};

export async function getZAI() {
  try {
    await fs.writeFile(path.join(process.cwd(), ".z-ai-config"), JSON.stringify(ZAI_CONFIG));
  } catch {}
  try {
    await fs.writeFile("/tmp/.z-ai-config", JSON.stringify(ZAI_CONFIG));
  } catch {}
  return await ZAI.create();
}
