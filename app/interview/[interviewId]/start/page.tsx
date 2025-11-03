"use client"
import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'next/navigation'
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Timer } from 'lucide-react';
import Image from 'next/image';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';
import { Mic } from 'lucide-react';
import { Phone } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import AppDialog from './_components/AppDialog';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Helper function to parse text-based response from webhook
function parseTextBasedResponse(textData: string): any {
    console.log("=== PARSING TEXT DATA ===");
    console.log("Raw text:", textData);
    const lines = textData.trim().split('\n');
    console.log("Total lines:", lines.length);
    const result: any = {};
    let currentKey = '';
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        console.log("Processing line:", trimmedLine);
        
        // Skip empty lines or main header
        if (!trimmedLine || trimmedLine === 'interview_analysis' || trimmedLine === 'Interview Analysis Report') {
            continue;
        }
        
        // Check if this is a numbered section (e.g., "3. Final Score")
        if (/^\d+\.\s/.test(trimmedLine)) {
            currentSection = trimmedLine;
            console.log(`Section: ${currentSection}`);
            continue;
        }
        
        // Check if line contains a colon (key:value pair)
        if (trimmedLine.includes(':')) {
            const colonIndex = trimmedLine.indexOf(':');
            const key = trimmedLine.substring(0, colonIndex).trim();
            const value = trimmedLine.substring(colonIndex + 1).trim();
            
            // Check if this is an array item (e.g., "0:value" or "1:value")
            if (/^\d+$/.test(key)) {
                // It's an array index
                if (!Array.isArray(result[currentKey])) {
                    result[currentKey] = [];
                }
                result[currentKey].push(value);
                console.log(`Added to array ${currentKey}: ${value}`);
            } else {
                // It's a regular key - map to standard field names
                let mappedKey = key;
                
                // Handle numbered section keys
                if (key.startsWith('1.') || key.includes('Question-wise')) {
                    mappedKey = 'questionWiseJustification';
                } else if (key === 'Score') {
                    mappedKey = 'finalScore';
                } else if (key.startsWith('4.') || key.includes('Reason for Deduction')) {
                    mappedKey = 'reasonForDeduction';
                } else if (key.startsWith('5.') || key === 'Conclusion') {
                    mappedKey = 'conclusion';
                } else if (key === 'final_score') {
                    mappedKey = 'finalScore';
                } else if (key === 'overall_performance') {
                    mappedKey = 'overallPerformance';
                } else if (key === 'ready_for_interview') {
                    mappedKey = 'readyForInterview';
                } else if (key === 'reason_for_deduction') {
                    mappedKey = 'reasonForDeduction';
                } else if (key === 'candidate_name') {
                    mappedKey = 'candidateName';
                }
                
                result[mappedKey] = value;
                currentKey = mappedKey;
                console.log(`Set ${mappedKey} = ${value}`);
            }
        } else if (trimmedLine === 'Strengths' || trimmedLine === 'Weaknesses' || trimmedLine === 'Weaknesses / Improvement Areas') {
            // This is a subsection header for arrays
            currentKey = trimmedLine === 'Strengths' ? 'strengths' : 'weaknesses';
            if (!result[currentKey]) {
                result[currentKey] = [];
            }
            console.log(`Subsection: ${currentKey}`);
        }
    }
    
    // Convert finalScore to number
    console.log("Before conversion - finalScore:", result.finalScore, typeof result.finalScore);
    if (result.finalScore && typeof result.finalScore === 'string') {
        // Handle formats like "12/20" or "12"
        if (result.finalScore.includes('/')) {
            result.finalScore = parseInt(result.finalScore.split('/')[0].trim(), 10);
            console.log("Converted from X/Y format:", result.finalScore);
        } else {
            result.finalScore = parseInt(result.finalScore, 10);
            console.log("Converted from plain number:", result.finalScore);
        }
    }
    console.log("After conversion - finalScore:", result.finalScore);
    
    // Convert arrays to comma-separated strings if needed
    if (Array.isArray(result.strengths)) {
        result.strengths = result.strengths.join(', ');
    }
    if (Array.isArray(result.weaknesses)) {
        result.weaknesses = result.weaknesses.join(', ');
    }
    
    // Use questionWiseJustification as overallPerformance if not set
    if (!result.overallPerformance && result.questionWiseJustification) {
        result.overallPerformance = result.questionWiseJustification;
    }
    
    console.log("Parsed text-based response:", result);
    return result;
}

type InterviewData = {
    jobTitle?: string | null;
    jobDescription?: string | null;
    interviewQuestions?: [InterviewQuestions];
    userId?: string | null;
    _id: string;
}

type InterviewQuestions = {
    answer: string;
    question: string;
}
type ResultData = {
    conclusion?: string;
    finalScore?: number;
    overallEvaluation?: string;
    reasonForDeduction?: string;
    strengths?: string;
    weakness?: string;
    
}

function Startinterview() {
    const [InterviewQuestions, setInterviewQuestions] = useState<InterviewData>()
    const { interviewId } = useParams();
    const convex = useConvex();
    const { userDetails, setUserDetails, isLoading } = useContext(UserDetailContext);
    const { user } = useUser();
    const[userActive,setUserActive]=useState(false)
    const [conversationData, setConversationData] = useState<any[]>([]);
    const conversationRef = React.useRef<any[]>([]);
    const Saveddata = useMutation(api.Result.Resultsave);
    const [Resultdata, setResultsdata] = useState<ResultData>();
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState(600);
    const [isInterviewActive, setIsInterviewActive] = useState(false);
    const [earlyExit, setEarlyExit] = useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const hasStartedCall = React.useRef(false);

    const vapiRef = React.useRef<Vapi | null>(null);
    if (!vapiRef.current) {
        vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');
    }

    useEffect(() => {
        GetInterviewQuestions();
    }, [interviewId])

    useEffect(() => {
        Resultsdata();
    }, [Resultdata])

    useEffect(() => {
       
        const canStartCall = InterviewQuestions?.interviewQuestions && 
                           InterviewQuestions.interviewQuestions.length > 0 && 
                           userDetails && 
                           user && 
                           !isLoading &&
                           !hasStartedCall.current;
        
        if (canStartCall) {
            console.log('✅ All data loaded, starting call...', {
                user: user.fullName,
                userDetails: userDetails._id,
                questions: InterviewQuestions.interviewQuestions?.length || 0
            });
            hasStartedCall.current = true;
            Startcall();
        } else if (!hasStartedCall.current) {
            console.log('⏳ Waiting for data...', {
                hasQuestions: !!InterviewQuestions?.interviewQuestions?.length,
                hasUserDetails: !!userDetails,
                hasUser: !!user,
                isLoading
            });
        }
    }, [InterviewQuestions, userDetails, user, isLoading])

    
    useEffect(() => {
        return () => {
            console.log('🧹 Component unmounting, cleaning up Vapi');
            if (vapiRef.current) {
                vapiRef.current.removeAllListeners();
                try {
                    vapiRef.current.stop();
                } catch (e) {
                    console.log('Error stopping Vapi on unmount:', e);
                }
            }
        };
    }, [])

    
    useEffect(() => {
        if (isInterviewActive && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                       
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isInterviewActive, timeRemaining])


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    const handleTimeUp = async () => {
        setIsInterviewActive(false);
        toast.info("Time's up! Interview ended automatically.");
        await stopInterview();
    }



    const Startcall = () => {
        // @ts-ignore
        if (!InterviewQuestions) {
            console.log('No questions found yet');
            return;
        }
        
        if (!user || !userDetails) {
            console.log('❌ User or userDetails not available, aborting call');
            return;
        }
        
        console.log('🚀 Starting Vapi call with:', {
            user: user.fullName,
            userDetails: userDetails._id,
            jobTitle: InterviewQuestions.jobTitle
        });

        const questions = InterviewQuestions?.interviewQuestions || [];

     
        const numQuestions = Math.floor(Math.random() * 4) + 5; 
        const limitedQuestions = questions.slice(0, numQuestions);

        let questionList: string[] = [];
        // @ts-ignore
        limitedQuestions.forEach((q, index) => {
            questionList.push(`${q.question}`);
            console.log(q.question);
        });

       
        if (vapiRef.current) {
            console.log('🧹 Cleaning up old event listeners');
            vapiRef.current.removeAllListeners();
        }

        
        vapiRef.current?.on("call-start",()=> {
            console.log("✅ Call started successfully");
            setIsInterviewActive(true);
            toast.success("Call connected successfully!");
        })

        vapiRef.current?.on("speech-start",()=> {
            console.log("Speech started");
            setUserActive(false);
        })
        
        vapiRef.current?.on("speech-end",()=> {
            console.log("Speech ended");
            setUserActive(true);
        })
        
        // @ts-ignore
        vapiRef.current?.on("call-end", (callData: any)=> {
            console.log("📞 Call ended with data:", callData);
            setIsInterviewActive(false);
            if (callData?.conversation) {
                console.log("Conversation from call-end:", callData.conversation);
                conversationRef.current = callData.conversation;
                setConversationData(callData.conversation);
            }
            toast.info("Interview ended.");
        })

        vapiRef.current?.on("error", (error: any) => {
            console.error("❌ Vapi error:", error);
            toast.error("Call error: " + (error.message || "Unknown error"));
            setIsInterviewActive(false);
        })

        vapiRef.current?.on("message", async (message: any) => {
            console.log("New message received:", message);
            if (message.conversation && Array.isArray(message.conversation)) {
                console.log("Conversation data:", message.conversation);
                conversationRef.current = message.conversation;
                setConversationData(message.conversation);
            } else if (message.type === "transcript" && message.transcript) {
                console.log("Transcript:", message.transcript);
            }
        });

        
        const assistantOptions = {
            name: "AI Recruiter",
            // @ts-ignore
            firstMessage: "Hi "+user?.fullName+", how are you? Ready for your interview on "+InterviewQuestions?.jobTitle || "Software Engineer" + "?",
            transcriber: {
                provider: "deepgram" ,
                model: "nova-2" ,
                language: "en-US" ,
            },
            voice: {
                provider: "playht" ,
                voiceId: "jennifer",
            },
            model: {
                // @ts-ignore
                provider: "openai" ,
                model: "gpt-4" ,
                messages: [
                    {
                        role: "system",
                        
                        content: `
  You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
⏰ IMPORTANT: This interview has a 10-minute time limit. The timer is already running on the screen.

Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your `+InterviewQuestions?.jobTitle || "Software Engineer" + ` interview. You have 10 minutes for this interview, and U'll be asking `+numQuestions+` questions. Let's get started!"

CRITICAL: You will ask EXACTLY `+numQuestions+` questions from the list below - no more, no less. Ask them one by one.

Questions to ask:
`+questionList.map((q, i) => `${i+1}. ${q}`).join("\n") +`

Ask one question at a time u should ask more on technical also at last regarding project according to that reduce or increase marks and also you should ask also ask technical questions also from easy to medium and wait for the candidate's response before proceeding. Keep the questions clear and concise.
If the candidate answers confidently, proceed to the next question. Example:
"Great answer! Now, let's move on to the next one."
after asking 3 questions also ask have u done any project on this technology? if yes ask about the project details.
ask every question easy to medium and also must asks concepts in that level only and make sure interview should be realistic.

If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about the core concept behind this!"
Provide brief, encouraging feedback after each answer. Example:
"Excellent! That's a solid answer."
"Good try! Let's move on to the next one."

Keep the conversation natural and engaging—use casual phrases like "Alright, next question..." or "Let's tackle another one!"

MANDATORY: After completing ALL `+numQuestions+` questions (and ONLY after completing them), you MUST wrap up the interview by:
1. Thanking the candidate warmly
2. Providing a brief performance summary based on their answers. Examples:
   "That was excellent! You answered `+numQuestions+` questions and showed strong understanding in most areas. Great job!"
   OR
   "Good effort! You completed all `+numQuestions+` questions. You showed good potential, though there's room for improvement in a few areas. Keep practicing!"
3. End with an encouraging note: "Thanks for your time! The interview is now complete. Best of luck with your results!"

Key Guidelines:
✅ Ask EXACTLY `+numQuestions+` questions - count them carefully or 8 else U will be penalized.
✅ Be friendly, engaging, and witty 🎤
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ ALWAYS provide performance feedback after ALL questions are done
✅ Make the candidate feel comfortable and supported throughout
✅ After the final question's answer, immediately give your performance summary and end the interview
`.trim(),
                    },
                ],
            },
        };
   
        
        console.log('📞 Initiating Vapi call...');
        try {
            // @ts-ignore
            vapiRef.current?.start(assistantOptions);
            console.log('✅ Vapi start() called successfully');
        } catch (error) {
            console.error('❌ Failed to start Vapi call:', error);
            toast.error('Failed to start interview call');
            setIsInterviewActive(false);
        }
    }



    const Resultsdata = async() => {
        const result = await convex.query(api.Result.GetResults, {
            // @ts-ignore
            resultRecordId: interviewId
        })

        console.log("Result Data:", result)
        setResultsdata(result)
    }

    

    const GetInterviewQuestions = async () => {
        const result = await convex.query(api.interview.GetInterviewQuestions, {
            // @ts-ignore
            interviewRecordId: interviewId
        })

        setInterviewQuestions(result)

    }

  



    const stopInterview = async () => {
        try {
            console.log("Stopping interview...");
            const isEarlyExit = timeRemaining > 0 && isInterviewActive;
            if (isEarlyExit) {
                setEarlyExit(true);
                toast.warning("Interview ended early. Your score may be reduced.");
            }
            
            setIsInterviewActive(false);
            
          
            const currentCall = vapiRef.current;
            console.log("Current Vapi instance:", currentCall);
            
            
            vapiRef.current?.stop();
            
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
           
            const currentConversation = conversationRef.current;
        
            
           
            if (currentConversation && currentConversation.length > 0) {
                toast.loading("Saving interview data...");
                console.log("Sending conversation data:", currentConversation);

                const res = await axios.post("/api/generate-ai-questions/", {
                    conversation: currentConversation
                });

                console.log("Full API response:", res);
                console.log("Response data:", res.data);
                console.log("Response data structure:", JSON.stringify(res.data, null, 2));
                
                
                const responseData = res.data.result || res.data;
                console.log("Extracted response data:", responseData);
                
            
                let outputData = responseData.output || responseData;
                console.log("Output data:", outputData);
                console.log("Output data type:", typeof outputData);
                
               
                if (typeof outputData === 'string' && (outputData.includes('interview_analysis') || outputData.includes('Final Score') || outputData.includes('Score:'))) {
                    console.log("Parsing text-based format...");
                    const parsedData = parseTextBasedResponse(outputData);
                    outputData = parsedData;
                    console.log("Parsed text data:", outputData);
                }

                if (outputData['Interview Analysis Report']) {
                    outputData = outputData['Interview Analysis Report'];
                    console.log("Unwrapped Interview Analysis Report:", outputData);
                } else if (outputData['interview_analysis']) {
                    outputData = outputData['interview_analysis'];
                    console.log("Unwrapped interview_analysis:", outputData);
                } else if (outputData['interview_assessment']) {
                    outputData = outputData['interview_assessment'];
                    console.log("Unwrapped interview_assessment:", outputData);
                }
        
                const reportData = outputData.interview_analysis_report || outputData;
                console.log("Report data:", reportData);
               
                // Normalize snake_case field names
                if (reportData.final_score !== undefined && reportData.finalScore === undefined) {
                    reportData.finalScore = reportData.final_score;
                }
                if (reportData.overall_performance && !reportData.overallPerformance) {
                    reportData.overallPerformance = reportData.overall_performance;
                }
                if (reportData.reason_for_deduction && !reportData.reasonForDeduction) {
                    reportData.reasonForDeduction = reportData.reason_for_deduction;
                }
                if (reportData.question_wise_justification && !reportData.questionWiseJustification) {
                    reportData.questionWiseJustification = reportData.question_wise_justification;
                }
                
                // Handle nested overall_evaluation object
                if (reportData.overall_evaluation && typeof reportData.overall_evaluation === 'object') {
                    const evalObj = reportData.overall_evaluation;
                    
                    // Extract strengths from nested object
                    if (evalObj.strengths && !reportData.strengths) {
                        reportData.strengths = evalObj.strengths;
                    }
                    
                    // Handle weaknesses_improvement_areas
                    if (evalObj.weaknesses_improvement_areas && !reportData.weaknesses) {
                        reportData.weaknesses = evalObj.weaknesses_improvement_areas;
                    }
                }
                
                // Convert arrays to comma-separated strings
                if (Array.isArray(reportData.strengths)) {
                    reportData.strengths = reportData.strengths.length > 0 
                        ? reportData.strengths.join(', ') 
                        : 'Not available';
                }
                if (Array.isArray(reportData.weaknesses)) {
                    reportData.weaknesses = reportData.weaknesses.length > 0 
                        ? reportData.weaknesses.join(', ') 
                        : 'Not available';
                }
                
                console.log("After array conversion - strengths:", reportData.strengths);
                console.log("After array conversion - weaknesses:", reportData.weaknesses);
                
                
                if (reportData['3. Final Score'] && typeof reportData['3. Final Score'] === 'object') {
                    const scoreObj = reportData['3. Final Score'];
                    if (scoreObj.Score) {
                        reportData.finalScore = scoreObj.Score;
                        console.log("Extracted Score from nested object:", scoreObj.Score);
                    }
                }
                
               
                if (reportData['2. Overall Evaluation'] && typeof reportData['2. Overall Evaluation'] === 'object') {
                    const evalObj = reportData['2. Overall Evaluation'];
                    if (evalObj.Strengths) {
                        reportData.strengths = Array.isArray(evalObj.Strengths) ? evalObj.Strengths.join(', ') : evalObj.Strengths;
                    }
                    if (evalObj['Weaknesses / Improvement Areas']) {
                        reportData.weaknesses = Array.isArray(evalObj['Weaknesses / Improvement Areas']) 
                            ? evalObj['Weaknesses / Improvement Areas'].join(', ') 
                            : evalObj['Weaknesses / Improvement Areas'];
                    }
                }
                
                
                if (reportData['1. Question-wise Justification']) {
                    reportData.questionWiseJustification = reportData['1. Question-wise Justification'];
                }
                if (reportData['4. Reason for Deduction']) {
                    reportData.reasonForDeduction = reportData['4. Reason for Deduction'];
                }
                if (reportData['5. Conclusion']) {
                    reportData.conclusion = reportData['5. Conclusion'];
                }
                
                
                if (reportData.justification && !reportData.questionWiseJustification) {
                    reportData.questionWiseJustification = reportData.justification;
                }
                
                console.log("Report data after extraction:", reportData);
                
               
                const extractData = () => {
                    console.log("=== EXTRACTING DATA ===");
                    console.log("reportData.finalScore:", reportData.finalScore);
                    console.log("reportData.questionWiseJustification:", reportData.questionWiseJustification);
                    console.log("reportData.strengths:", reportData.strengths, "Type:", typeof reportData.strengths, "IsArray:", Array.isArray(reportData.strengths));
                    console.log("reportData.weaknesses:", reportData.weaknesses, "Type:", typeof reportData.weaknesses, "IsArray:", Array.isArray(reportData.weaknesses));
                    
                    
                    if (reportData.finalScore !== undefined) {
                        console.log("✅ Found finalScore, extracting all data");
                        
                      
                        let finalScore = reportData.finalScore;
                        if (typeof finalScore === 'string') {
                            if (finalScore.includes('/')) {
                                finalScore = parseInt(finalScore.split('/')[0].trim(), 10);
                            } else {
                                finalScore = parseInt(finalScore, 10);
                            }
                        }
                        console.log("Parsed finalScore:", finalScore);
                        
                        const strengthsData = reportData.strengths;
                        let strengthsString = "Not available";
                        if (strengthsData) {
                            if (typeof strengthsData === 'string') {
                                strengthsString = strengthsData.trim() || "Not available";
                            } else if (Array.isArray(strengthsData) && strengthsData.length > 0) {
                                strengthsString = strengthsData.join(', ');
                            }
                        }
                        
                        const weaknessesData = reportData.weaknesses;
                        let weaknessesString = "Not available";
                        if (weaknessesData) {
                            if (typeof weaknessesData === 'string') {
                                weaknessesString = weaknessesData.trim() || "Not available";
                            } else if (Array.isArray(weaknessesData) && weaknessesData.length > 0) {
                                weaknessesString = weaknessesData.join(', ');
                            }
                        }
                        
                        console.log("Final strengthsString:", strengthsString);
                        console.log("Final weaknessesString:", weaknessesString);
                      
                        const overallEval = reportData.questionWiseJustification || 
                                          reportData.overallPerformance || 
                                          reportData.overall_performance || 
                                          "No evaluation provided";
                        
                        return {
                            finalScore: finalScore,
                            overallEval: overallEval,
                            strengths: strengthsString,
                            weaknesses: weaknessesString,
                            reasonForDeduction: reportData.reasonForDeduction || reportData.reason_for_deduction || "Not available",
                            conclusion: reportData.conclusion || "Not available"
                        };
                    }
                   
                    if (reportData.final_score !== undefined || reportData.finalScore !== undefined) {
                       
                        if (reportData.justification && (reportData.strengths || reportData.weaknesses)) {
                            const strengthsData = reportData.strengths || "Not available";
                            const strengthsString = Array.isArray(strengthsData) 
                                ? strengthsData.join(', ') 
                                : String(strengthsData);
                            
                            const weaknessesData = reportData.weaknesses || "Not available";
                            const weaknessesString = Array.isArray(weaknessesData) 
                                ? weaknessesData.join(', ') 
                                : String(weaknessesData);
                            
                            return {
                                finalScore: reportData.final_score || reportData.finalScore,
                                overallEval: reportData.justification || "No evaluation provided",
                                strengths: strengthsString,
                                weaknesses: weaknessesString,
                                reasonForDeduction: reportData.reason_for_deduction || reportData.reasonForDeduction || "Not available",
                                conclusion: reportData.conclusion || "Not available"
                            };
                        }
                        
                      
                        const evaluation = reportData.overall_evaluation || reportData.overallEvaluation || {};
                        const questionWise = reportData.question_wise_justification || reportData.questionWiseJustification || [];
                        
                     
                        let overallEvalText = "No evaluation provided";
                        if (Array.isArray(questionWise) && questionWise.length > 0) {
                            overallEvalText = questionWise.map((item: any) => 
                                `Q: ${item.question}\nA: ${item.candidate_answer}\nAnalysis: ${item.analysis}`
                            ).join('\n\n');
                        }
                        
                      
                        const strengthsData = evaluation.strengths || "Not available";
                        const strengthsString = Array.isArray(strengthsData) 
                            ? strengthsData.join(', ') 
                            : String(strengthsData);
                        
                       
                        const weaknessesData = evaluation.weaknesses_or_improvement_areas || evaluation.weaknesses || "Not available";
                        const weaknessesString = Array.isArray(weaknessesData) 
                            ? weaknessesData.join(', ') 
                            : String(weaknessesData);
                        
                        return {
                            finalScore: reportData.final_score || reportData.finalScore,
                            overallEval: overallEvalText,
                            strengths: strengthsString,
                            weaknesses: weaknessesString,
                            reasonForDeduction: reportData.reason_for_deduction || reportData.reasonForDeduction || "Not available",
                            conclusion: reportData.conclusion || "Not available"
                        };
                    }
                    
                  
                    if (outputData.finalScore !== undefined || outputData.final_score !== undefined) {
                        const evaluation = outputData.overallEvaluation || outputData.overall_evaluation || {};
                        return {
                            finalScore: outputData.finalScore || outputData.final_score,
                            overallEval: outputData.questionWiseJustification || outputData.question_wise_justification || "No evaluation provided",
                            strengths: Array.isArray(evaluation.strengths) 
                                ? evaluation.strengths.join(', ') 
                                : (evaluation.strengths || "Not available"),
                            weaknesses: Array.isArray(evaluation.weaknesses) 
                                ? evaluation.weaknesses.join(', ') 
                                : (evaluation.weaknesses || "Not available"),
                            reasonForDeduction: outputData.reasonForDeduction || outputData.reason_for_deduction || "Not available",
                            conclusion: outputData.conclusion || "Not available"
                        };
                    }
                    
                    
                    const finalScoreKey = outputData['3_final_score'] || outputData['3.Final Score'] || outputData['3. Final Score'] || outputData['3_Final_Score'];
                    if (finalScoreKey !== undefined) {
                        let finalScore = 0;
                        if (typeof finalScoreKey === 'string' && finalScoreKey.includes('/')) {
                            finalScore = parseInt(finalScoreKey.split('/')[0].trim());
                        } else {
                            finalScore = Number(finalScoreKey) || 0;
                        }
                        
                        const evaluation = outputData['2_overall_evaluation'] || outputData['2.Overall Evaluation'] || outputData['2. Overall Evaluation'] || outputData['2_Overall_Evaluation'] || {};
                        
                      
                        const strengthsData = evaluation.Strengths || evaluation.strengths || "Not available";
                        const strengths = Array.isArray(strengthsData) 
                            ? strengthsData.join(', ') 
                            : String(strengthsData);
                        
                        
                        const weaknessesData = evaluation['Weaknesses / Improvement Areas'] || evaluation.Weaknesses || evaluation.weaknesses || "Not available";
                        const weaknesses = Array.isArray(weaknessesData) 
                            ? weaknessesData.join(', ') 
                            : String(weaknessesData);
                        
                        const questionJustification = outputData['1_question_wise_justification'] || outputData['1.Question-wise Justification'] || outputData['1. Question-wise Justification'] || outputData['1_Question_Justification'];
                        let overallEvalText = "No evaluation provided";
                        
                        if (questionJustification && typeof questionJustification === 'object') {
                            const justificationValues = Object.values(questionJustification);
                            overallEvalText = justificationValues.join(' ');
                        } else if (typeof questionJustification === 'string') {
                            overallEvalText = questionJustification;
                        }
                        
                        return {
                            finalScore,
                            overallEval: overallEvalText,
                            strengths,
                            weaknesses,
                            reasonForDeduction: outputData['4_reason_for_deduction'] || outputData['4.Reason for Deduction'] || outputData['4. Reason for Deduction'] || outputData['4_Reason_for_Deduction'] || "Not available",
                            conclusion: outputData['5_conclusion'] || outputData['5.Conclusion'] || outputData['5. Conclusion'] || outputData['5_Conclusion'] || "Not available"
                        };
                    }
                    
                    return null;
                };
                
                const extractedData = extractData();
                
                if (extractedData) {
                    toast.dismiss();
                    console.log("Extracted data:", extractedData);
                    
                  
                    let finalScore = extractedData.finalScore;
                    let reasonForDeduction = extractedData.reasonForDeduction;
                    
                    if (earlyExit || (timeRemaining > 0 && isEarlyExit)) {
                        const penalty = Math.floor(finalScore * 0.15); 
                        finalScore = Math.max(0, finalScore - penalty);
                        reasonForDeduction = `Early exit penalty applied (-${penalty} points). ${reasonForDeduction}`;
                        console.log(`Early exit detected. Score reduced from ${extractedData.finalScore} to ${finalScore}`);
                    }
                    
                    const savedResult = await Saveddata({
                        udid: userDetails?._id,
                        overallEvaluation: extractedData.overallEval,
                        finalScore: finalScore,
                        strengths: extractedData.strengths,
                        weakness: extractedData.weaknesses,
                        reasonForDeduction: reasonForDeduction,
                        conclusion: extractedData.conclusion
                    });
                    console.log("Saved data result:", savedResult);
                    toast.success("Interview data saved successfully!");
                    router.push('/interview/' + savedResult + '/result');
                } else {
                    toast.dismiss();
                    console.error("Webhook did not return expected data structure.");
                    console.error("Got:", outputData);
                    toast.error("Webhook did not process the interview correctly");
                }
                
            } else {
                console.log("No conversation data to send");
                console.log("Conversation ref length:", currentConversation?.length || 0);
                console.warn("⚠️ Conversation data is empty. Check if Vapi events are firing correctly.");
                toast.error("No conversation data available. Please ensure the interview was conducted.");
            }
        } catch (e) {
            console.error("Error sending to webhook:", e);
            toast.error("Failed to save interview data");
        }
    }

    // Show loading state while initializing
    if (isLoading || !userDetails || !user || !InterviewQuestions) {
        return (
            <div className='p-20 lg:px-48 xl:px-56'>
                <div className='flex flex-col items-center justify-center h-[500px]'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600'></div>
                    <h2 className='mt-4 text-xl font-semibold text-gray-700'>Initializing Interview...</h2>
                    <p className='mt-2 text-gray-500'>Please wait while we set up your session</p>
                </div>
            </div>
        );
    }

    return (
        <div className='p-20 lg:px-48 xl:px-56'>
            <h2 className='flex font-bold text-xl justify-between'> AI Interview Session
                <span className={`flex gap-2 items-center ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : timeRemaining < 180 ? 'text-orange-500' : 'text-green-600'}`}>
                    <Timer />
                    {formatTime(timeRemaining)}
                </span>
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-3'>
                <div className='bg-gray-100 h-[400px] rounded-lg border flex flex-col items-center justify-center'>
                    <div className='relative'>
                       {!userActive && <span className='absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping' />}
                    <Image src={'/ai9.png'} alt='AI Image' width={100} height={100} className='w-[60px] h-[60px] rounded-full object-cover' />
                    </div>
                    <h2 className='mt-3 font-bold text-lg'>AI Recruiter</h2>

                </div>

                <div className='bg-gray-100 h-[400px] rounded-lg border flex flex-col items-center justify-center'>
                    <div className='relative'>
                    {userActive && <span className='absolute inset-0 rounded-full bg-gray-500 opacity-75 animate-ping' />}
                    <Image src={user?.imageUrl || '/ai7.png'} alt='User Image' width={100} height={100} className='w-[60px] h-[60px] rounded-full object-cover' />
                    </div>
                    <h2 className='mt-3 font-medium text-lg'>{user?.fullName || 'User Name'}</h2>
                </div>

            </div>

            <div className='flex items-center justify-center gap-5 mt-6'>
                <Mic className='h-12 w-12 p-3 bg-gray-500 text-white rounded-full cursor-pointer' />
                <AppDialog stopinterview={() => stopInterview()}>
                <Phone className='h-12 w-12 p-3 bg-red-500 text-white rounded-full cursor-pointer' />
                </AppDialog>

            </div>
            <div className='text-center mt-4'>
                <p className='text-gray-500 text-lg'>Interview in progress...</p>
            </div>

        </div>
    )
}

export default Startinterview