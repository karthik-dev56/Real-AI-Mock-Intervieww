import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewUser=mutation({
    args:{
        name:v.string(),
        imageUrl:v.string(),
        email:v.string()
    },
    handler:async(ctx,args)=>{
        const user = await ctx.db.query('userTable')
        .filter(q=>q.eq(q.field('email'),args.email)).collect();

        const data={
            email:args.email,
            imageUrl:args?.imageUrl,
            name:args.name
        }

        if(user?.length==0){
            const result = await ctx.db.insert('userTable',{
                ...data
            })

            console.log(result)

            return {
                ...data,
                result
            }
        }
        return user[0];
    }
})