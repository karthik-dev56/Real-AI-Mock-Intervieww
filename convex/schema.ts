import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userTable: defineTable({
    name: v.string(),
    imageUrl: v.string(),
    email: v.string(),
   
  }),
  InterviewSessionTable: defineTable({
    interviewQuestions: v.optional(v.any()),
    resumeUrl: v.union(v.string(), v.null()),
    userId: v.id('userTable'),
    status: v.string(),
    jobTitle: v.optional(v.union(v.string(), v.null())),
    jobDescription: v.optional(v.union(v.string(), v.null())),
  }),
  ResultTable: defineTable({
    udid: v.id('userTable'),
    overallEvaluation: v.optional(v.any()),
    finalScore: v.optional(v.number()),
    strengths: v.optional(v.string()),
    weakness: v.optional(v.string()),
    reasonForDeduction: v.optional(v.string()),
    conclusion: v.optional(v.string()),

  })
    
});
    