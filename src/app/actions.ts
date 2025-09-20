"use server";

import { generateCode } from "@/ai/flows/prompt-to-code";
import { selectTheme } from "@/ai/flows/smart-theme-selection";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const promptSchema = z.string().min(10, {
  message: "Prompt must be at least 10 characters long.",
});

export async function generateWebsite(prompt: string) {
  const validation = promptSchema.safeParse(prompt);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  try {
    const [{ theme }, { pages, css, js }] = await Promise.all([
      selectTheme({ prompt: validation.data }),
      generateCode({ prompt: validation.data }),
    ]);

    return {
      theme,
      code: { pages, css, js },
    };
  } catch (error) {
    console.error("Error generating website:", error);
    throw new Error(
      "Failed to generate website. The AI model might be busy. Please try again later."
    );
  }
}

const assetsDir = path.join(process.cwd(), "public", "assets");

async function ensureAssetsDir() {
  try {
    await fs.access(assetsDir);
  } catch {
    await fs.mkdir(assetsDir, { recursive: true });
  }
}

export async function getAssets() {
  await ensureAssetsDir();
  const files = await fs.readdir(assetsDir);
  return files.map((file) => `/assets/${file}`);
}

export async function uploadAsset(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  await ensureAssetsDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(assetsDir, file.name), buffer);
  
  revalidatePath("/");
  return { success: true, filename: file.name };
}

export async function deleteAsset(filename: string) {
  if (!filename) {
    throw new Error("No filename provided");
  }
  
  await ensureAssetsDir();
  // Basic security check to prevent path traversal
  if (filename.includes("..") || filename.includes("/")) {
    throw new Error("Invalid filename");
  }

  await fs.unlink(path.join(assetsDir, filename));
  revalidatePath("/");
  return { success: true };
}
