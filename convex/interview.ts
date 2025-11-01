import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const SaveInterview=mutation({
    args:{
        interviewQuestions:v.optional(v.any()),
        resumeUrl:v.union(v.string(), v.null()),
        userId:v.id('userTable'),
        status:v.string(),
        jobTitle:v.optional(v.union(v.string(), v.null())),
        jobDescription:v.optional(v.union(v.string(), v.null()))
    },
    handler:async(ctx,args)=>{
        const result = await ctx.db.insert('InterviewSessionTable',{
            interviewQuestions:args.interviewQuestions,
            resumeUrl:args.resumeUrl,
            userId:args.userId,
            status:args.status,
            jobTitle:args.jobTitle,
            jobDescription:args.jobDescription
        })
        return result;
    }

})

export const GetInterviewQuestions=query({
    args:{
        interviewRecordId: v.id('InterviewSessionTable')
    },
     handler: async (ctx, args) => {
        const result = await ctx.db.query('InterviewSessionTable')
        .filter((q) => q.eq(q.field("_id"), args.interviewRecordId))
        .collect()
        return result[0];
    }
})