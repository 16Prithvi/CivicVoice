import { Comment } from "@/types";

const COMMENTS_KEY = "civicvoice_comments";

export function getComments(reportId: string): Comment[] {
  if (typeof window === "undefined") return [];
  const commentsJson = localStorage.getItem(COMMENTS_KEY);
  if (!commentsJson) return [];
  
  const allComments: Comment[] = JSON.parse(commentsJson);
  return allComments
    .filter((c) => c.reportId === reportId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addComment(comment: Omit<Comment, "id" | "upvotes" | "createdAt">): Comment {
  const newComment: Comment = {
    ...comment,
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    upvotes: 0,
    createdAt: new Date().toISOString(),
  };

  const allComments = getAllComments();
  allComments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  
  return newComment;
}

export function upvoteComment(commentId: string, userId: string): Comment | null {
  const allComments = getAllComments();
  const comment = allComments.find((c) => c.id === commentId);
  if (!comment) return null;

  const upvoteKey = `upvote_${commentId}_${userId}`;
  const hasUpvoted = localStorage.getItem(upvoteKey) === "true";

  if (hasUpvoted) {
    comment.upvotes = Math.max(0, comment.upvotes - 1);
    localStorage.removeItem(upvoteKey);
  } else {
    comment.upvotes++;
    localStorage.setItem(upvoteKey, "true");
  }

  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  return comment;
}

function getAllComments(): Comment[] {
  if (typeof window === "undefined") return [];
  const commentsJson = localStorage.getItem(COMMENTS_KEY);
  return commentsJson ? JSON.parse(commentsJson) : [];
}








