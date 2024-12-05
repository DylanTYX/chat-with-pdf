"use server";

import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {
  auth.protect(); // Protect this route with Clerk

  // Turn a PDF into embeddings and store them in Pinecone
  await generateEmbeddingsInPineconeVectorStore(docId);

  revalidatePath("/dashboard");

  return { completed: true };
}
