import { NextRequest } from "next/server";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import axios from "axios";
import { aj } from "@/utils/route";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

var imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
})

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';
        const user = await currentUser();
        const {has} = await auth();
        
     
        if (contentType.includes('application/json')) {
            // console.log("Processing conversation data...");
            const { conversation } = await req.json();
            // console.log("Received conversation:", conversation);
            
            try {
                const ress = await axios.post("https://dev-58.app.n8n.cloud/webhook/interview-mockk", {
                    conversation: conversation
                });
                // console.log("Full n8n response:", ress.data);
                // console.log("Response structure:", JSON.stringify(ress.data, null, 2));

                
                
             
                let responseData;
                if (ress.data.message && ress.data.message.conversation) {
                    responseData = {
                        result: ress.data.message.conversation,
                        ...ress.data.message.conversation
                    };
                } else if (ress.data.conversation) {
                    responseData = {
                        result: ress.data.conversation,
                        ...ress.data.conversation
                    };
                } else {
                    
                    responseData = ress.data;
                }

                // console.log("Sending response:", responseData);
                return NextResponse.json(responseData);
            } catch (error) {
                console.error("Error calling n8n webhook:", error);
                if (axios.isAxiosError(error)) {
                    console.error("n8n response error:", error.response?.data);
                }
                throw error;
            }
        }
        
  
        const formData = await req.formData()
        const file = formData.get('file') as File;
        const jobTitle = formData.get('jobTitle') as string;
        const jobDescription = formData.get('jobDescription') as string;



        const decision = await aj.protect(req, { userId: user?.primaryEmailAddress?.emailAddress || '', requested: 1 }); 
        console.log("Arcjet decision", decision);
        const hasBronzePlan = has({ plan: 'pro' })

        // @ts-ignore
        if (decision?.reason?.remaining == 0) {
            return NextResponse.json({
                status: 429,
                result: "No free credits left. Please upgrade your plan to continue using our services."
            })
        }





        if (file) {



            if (!(file instanceof File)) {
                console.error('Invalid file type');
                return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
            }

            // console.log('File received:', file.name, 'Size:', file.size);


        

            // console.log('File received:', file.name, 'Size:', file.size);

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);



            console.log('Attempting to upload to ImageKit...');
            const uploadPdf = await imagekit.upload({
                file: buffer,
                fileName: Date.now().toString() + ".pdf",
                isPublished: true
            });

            const result = await axios.post('https://dev-58.app.n8n.cloud/webhook/generate-ai-interview', {
                resumeUrl: uploadPdf?.url
            })
            // console.log(result.data?.output?.interview_questions);

          


            // console.log('Upload successful:', uploadPdf.url);
            return NextResponse.json({
                questions: result.data?.output?.interview_questions,
                resumeUrl: uploadPdf?.url
            });
        } else {
            const result = await axios.post('https://dev-58.app.n8n.cloud/webhook/generate-ai-interview', {
                resumeUrl: null,
                jobTitle: jobTitle,
                jobDescription: jobDescription

            })
            console.log(result.data?.output?.interview_questions);


            return NextResponse.json({
                questions: result.data?.output?.interview_questions,
                resumeUrl: null

            });
        }
    } catch (e) {
        console.error('Error in generate-ai-questions API:', e);
        return NextResponse.json({
            error: "Failed to upload",
            message: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
    }
}

