"use server";

import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { Message } from "@/components/Chat";
import { generateLangchainCompletion } from "@/lib/langchain";

const FREE_LIMIT = 3;
const PRO_LIMIT = 100;

export async function askQuestion(id: string, question: string) {
  auth.protect(); // Protect this route with Clerk
  const { userId } = await auth();

  const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

  // Check how many user messages are in the chat
  const chatSnapshot = await chatRef.get();
  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "human"
  );

  const userMessage: Message = {
    role: "human",
    message: question,
    createdAt: new Date(),
  };

  await chatRef.add(userMessage); // Add the user message to the collection

  // Generate AI response
  const reply = await generateLangchainCompletion(id, question);

  const aiMessage: Message = {
    role: "ai",
    message: reply,
    createdAt: new Date(),
  };

  await chatRef.add(aiMessage); // Add the AI message to the collection

  return { success: true, message: null };
}
