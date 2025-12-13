import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import axios from 'axios';
export async function POST(req: NextRequest) {
    try {
        const {email,interviewLink} = await req.json();
        const result  = await axios.post("https://rajj56.app.n8n.cloud/webhook/mail-send",{
            email: email,
            interviewLink: interviewLink
        })
        return NextResponse.json({message: "Mail Sent Successfully",status:200})
    } catch (error) {
        console.error("Error sending mail:", error);
        return NextResponse.json({message: "Error sending mail", status:500})
    }
}

