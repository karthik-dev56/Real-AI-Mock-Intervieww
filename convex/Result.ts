import { mutation, query } from "./_generated/server"
import { v } from "convex/values";
export const Resultsave=mutation({
    args:{
      udid: v.id('userTable'),
       overallEvaluation: v.optional(v.any()),
       finalScore: v.optional(v.number()),
       strengths: v.optional(v.string()),
       weakness: v.optional(v.string()),
       reasonForDeduction: v.optional(v.string()),
       conclusion: v.optional(v.string()),
   
    },
    handler:async(ctx,args)=>{
        const result = await ctx.db.insert('ResultTable',{
            udid:args.udid,
            overallEvaluation:args.overallEvaluation,
            finalScore:args.finalScore,
            strengths:args.strengths,
            weakness:args.weakness,
            reasonForDeduction:args.reasonForDeduction,
            conclusion:args.conclusion,
        })
        return result;
    }

})

export const GetResults=query({
    args:{
        resultRecordId: v.id('ResultTable')
    },
     handler: async (ctx, args) => {
        const result = await ctx.db.query('ResultTable')
        .filter((q) => q.eq(q.field("_id"), args.resultRecordId))
        .collect()
        return result[0];
    }
})

export const GetResultsByUserId=query({
    args:{
        userId: v.id('userTable')
    },
     handler: async (ctx, args) => {
        const results = await ctx.db.query('ResultTable')
        .filter((q) => q.eq(q.field("udid"), args.userId))
        .collect()
        return results;
    }
})

export const GetResultsByUserEmail=query({
    args:{
        email: v.string()
    },
     handler: async (ctx, args) => {
        const user = await ctx.db.query('userTable')
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
        
        if (!user) return [];
        
        const results = await ctx.db.query('ResultTable')
        .filter((q) => q.eq(q.field("udid"), user._id))
        .collect()
        return results;
    }
})