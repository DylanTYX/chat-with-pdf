"use server";

import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { Message } from "@/components/Chat";
import { generateLangchainCompletion } from "@/lib/langchain";

const PRO_LIMIT = 20;
const FREE_LIMIT = 2;

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

  // Check membership limits for messages in a document
  const useRef = await adminDb.collection("users").doc(userId!).get();

  // Limit the PRO/FREE users
  // Check if user is on FREE plan and has asked more than the FREE number of questions
  if (!useRef.data()?.hasActiveMembership) {
    if (userMessages.length >= FREE_LIMIT) {
      return {
        success: false,
        message: `You'll need to upgrade to PRO to ask more than ${FREE_LIMIT} questions!`,
      };
    }
  }

  // Check if user is on PRO plan and has asked more than 20 questions
  if (useRef.data()?.hasActiveMembership) {
    if (userMessages.length >= PRO_LIMIT) {
      return {
        success: false,
        message: `You've reached the PRO limit of ${PRO_LIMIT} questions per document!`,
      };
    }
  }

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
