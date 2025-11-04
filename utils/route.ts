import arcjet, { tokenBucket } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!, 
  rules: [
    
    tokenBucket({
      mode: "LIVE", 
      characteristics: ["userId"], 
      refillRate: 2, 
      interval: 86400, 
      capacity: 3, 
    }),
  ],
});
