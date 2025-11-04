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
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import AppDialog from './_components/AppDialog';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';


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
        
       
        if (!trimmedLine || trimmedLine === 'interview_analysis' || trimmedLine === 'Interview Analysis Report') {
            continue;
        }
        
      
        if (/^\d+\.\s/.test(trimmedLine)) {
            currentSection = trimmedLine;
            console.log(`Section: ${currentSection}`);
            continue;
        }
        
 
        if (trimmedLine.includes(':')) {
            const colonIndex = trimmedLine.indexOf(':');
            const key = trimmedLine.substring(0, colonIndex).trim();
            const value = trimmedLine.substring(colonIndex + 1).trim();
            

            if (/^\d+$/.test(key)) {
               
                if (!Array.isArray(result[currentKey])) {
                    result[currentKey] = [];
                }
                result[currentKey].push(value);
                console.log(`Added to array ${currentKey}: ${value}`);
            } else {
              
                let mappedKey = key;
                
               
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
            
            currentKey = trimmedLine === 'Strengths' ? 'strengths' : 'weaknesses';
            if (!result[currentKey]) {
                result[currentKey] = [];
            }
            console.log(`Subsection: ${currentKey}`);
        }
    }
    
    
    console.log("Before conversion - finalScore:", result.finalScore, typeof result.finalScore);
    if (result.finalScore && typeof result.finalScore === 'string') {
        
        if (result.finalScore.includes('/')) {
            result.finalScore = parseInt(result.finalScore.split('/')[0].trim(), 10);
            console.log("Converted from X/Y format:", result.finalScore);
        } else {
            result.finalScore = parseInt(result.finalScore, 10);
            console.log("Converted from plain number:", result.finalScore);
        }
    }
    console.log("After conversion - finalScore:", result.finalScore);
   
    if (Array.isArray(result.strengths)) {
        result.strengths = result.strengths.join(', ');
    }
    if (Array.isArray(result.weaknesses)) {
        result.weaknesses = result.weaknesses.join(', ');
    }
    
   
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
    const [micPermissionGranted, setMicPermissionGranted] = useState(false);
    const [vapiReady, setVapiReady] = useState(false);
    const [readyToStart, setReadyToStart] = useState(false);
    const [showStartButton, setShowStartButton] = useState(false);
    const isInitialMount = React.useRef(true);
    const isInitializingVapi = React.useRef(false);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showConnectionError, setShowConnectionError] = useState(false);
    const [connectionErrorMessage, setConnectionErrorMessage] = useState('');
    

    useEffect(() => {
        const hasSeenWelcome = sessionStorage.getItem('hasSeenInterviewWelcome');
        
        if (!hasSeenWelcome) {
            setTimeout(() => {
                setShowWelcomePopup(true);
            }, 1000);
        }
    }, []);
    
    const handleCloseWelcomePopup = () => {
        setShowWelcomePopup(false);
        sessionStorage.setItem('hasSeenInterviewWelcome', 'true');
    };
    
  
    useEffect(() => {
        console.log('🔄 Component mounted - Resetting all states');
        hasStartedCall.current = false;
        isInitializingVapi.current = false;
        setIsInterviewActive(false);
        setShowStartButton(false);
        setReadyToStart(false);
        setVapiReady(false);
        isInitialMount.current = true;
        
        return () => {
            console.log('🧹 Component will unmount');
            isInitialMount.current = false;
            isInitializingVapi.current = false;
        };
    }, []);
    
    useEffect(() => {
        const requestMicrophonePermission = async () => {
            try {
                console.log('🎤 Requesting microphone permission...');
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('✅ Microphone permission granted');
                setMicPermissionGranted(true);
             
                stream.getTracks().forEach(track => track.stop());
            } catch (error) {
                console.error('❌ Microphone permission denied:', error);
                toast.error('Microphone access is required for the interview. Please grant permission and reload.');
                setMicPermissionGranted(false);
            }
        };
        
        requestMicrophonePermission();
    }, []);
    

    useEffect(() => {
        if (!vapiRef.current && micPermissionGranted && !isInitializingVapi.current) {
            isInitializingVapi.current = true; 
            console.log('🔧 Initializing Vapi instance (mic permission granted)');
            const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
            console.log('API Key status:', apiKey ? `Present (length: ${apiKey.length})` : 'MISSING!');
            
            if (!apiKey) {
                console.error('❌ NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set!');
                toast.error('Voice service API key not configured');
                isInitializingVapi.current = false;
                return;
            }
            
           
            setTimeout(() => {
                try {
                    
                    if (vapiRef.current) {
                        console.log('🧹 Cleaning up existing Vapi instance');
                        vapiRef.current.removeAllListeners();
                        try {
                            vapiRef.current.stop();
                        } catch (e) {
                            console.log('Error stopping existing instance:', e);
                        }
                        vapiRef.current = null;
                    }
                    
                    vapiRef.current = new Vapi(apiKey);
                    console.log('✅ Vapi instance created successfully');
                  
                    setTimeout(() => {
                        setVapiReady(true);
                        isInitializingVapi.current = false; 
                        console.log('✅ Vapi is now ready to start calls');
                    }, 800);
                } catch (error) {
                    console.error('❌ Failed to create Vapi instance:', error);
                    toast.error('Failed to initialize voice interface. Please refresh the page.');
                    isInitializingVapi.current = false;
                }
            }, 500); 
        }
    }, [micPermissionGranted]);    useEffect(() => {
        if (interviewId) {
            GetInterviewQuestions();
        }
    }, [interviewId])

    useEffect(() => {
        if (interviewId) {
            Resultsdata();
        }
    }, [interviewId])

    
    useEffect(() => {
        const allReady = InterviewQuestions?.interviewQuestions && 
                        InterviewQuestions.interviewQuestions.length > 0 && 
                        userDetails && 
                        user && 
                        !isLoading &&
                        vapiRef.current &&
                        micPermissionGranted &&
                        vapiReady;
        
        if (allReady && !readyToStart) {
            console.log('✅ All data loaded and ready!', {
                user: user.fullName,
                userDetails: userDetails._id,
                questions: InterviewQuestions.interviewQuestions?.length || 0,
                micPermission: micPermissionGranted,
                vapiReady: vapiReady
            });
            setReadyToStart(true);
            
            setTimeout(() => {
                setShowStartButton(true);
                console.log('✅ Ready to start interview - waiting for user to click button');
            }, 1000);
        } else if (!readyToStart) {
            console.log('⏳ Waiting for data...', {
                hasQuestions: !!InterviewQuestions?.interviewQuestions?.length,
                hasUserDetails: !!userDetails,
                hasUser: !!user,
                hasVapi: !!vapiRef.current,
                hasMicPermission: micPermissionGranted,
                vapiReady: vapiReady,
                isLoading
            });
        }
    }, [InterviewQuestions, userDetails, user, isLoading, micPermissionGranted, vapiReady])
    

    const handleStartInterview = () => {
        if (hasStartedCall.current || isConnecting) {
            console.log('⚠️ Call already started or connecting, ignoring duplicate click');
            return;
        }
        
        if (!vapiRef.current) {
            console.log('❌ Vapi not ready yet');
            toast.error('Voice interface not ready. Please wait a moment and try again.');
            return;
        }
        
        console.log('🚀 Starting interview...');
        setIsConnecting(true);
        hasStartedCall.current = true;
        setShowStartButton(false);
        
        setTimeout(() => {
            Startcall();
        }, 500);
    }

    
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
                vapiRef.current = null;
            }
       
            hasStartedCall.current = false;
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
            jobTitle: InterviewQuestions.jobTitle,
            hasVapiInstance: !!vapiRef.current,
            vapiReady: vapiReady,
            micPermission: micPermissionGranted
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
            console.log('🧹 Cleaning up old event listeners before starting new call');
            vapiRef.current.removeAllListeners();
            
          
            try {
                vapiRef.current.stop();
                console.log('✅ Stopped any existing call');
            } catch (e) {
                console.log('ℹ️ No existing call to stop (this is normal)');
            }
        }

        
        vapiRef.current?.on("call-start",()=> {
            console.log("✅ Call started successfully");
            setIsInterviewActive(true);
            setIsConnecting(false);
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
            hasStartedCall.current = false; 
            if (callData?.conversation) {
                console.log("Conversation from call-end:", callData.conversation);
                conversationRef.current = callData.conversation;
                setConversationData(callData.conversation);
            }
            toast.info("Interview ended.");
        })

        vapiRef.current?.on("error", (error: any) => {
            console.error("❌ Vapi error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            
            let errorMessage = "Unknown error";
            let errorType = error?.error?.type || error?.type;
            let isConnectionError = false;
           
            const isTransientError = errorType === 'no-room' || 
                                    errorType === 'daily-call-join-error' ||
                                    error?.errorMsg?.includes("Meeting has ended");
        
            if (errorType === 'no-room' || error?.error?.msg?.includes('room was deleted')) {
                errorMessage = "Connection issue detected. Please reload the page.";
                isConnectionError = true;
            } else if (errorType === 'ejected') {
                errorMessage = "Connection issue detected. Please reload the page.";
                isConnectionError = true;
            } else if (errorType === 'daily-call-join-error' || errorType === 'start-method-error') {
                errorMessage = "Connection Failed - Internet Issue";
                isConnectionError = true;
            } else {
                if (error?.errorMsg) {
                    errorMessage = error.errorMsg;
                } else if (error?.error?.msg) {
                    errorMessage = error.error.msg;
                } else if (error?.error?.message) {
                    errorMessage = error.error.message;
                } else if (error?.message) {
                    errorMessage = error.message;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }
                
                if (errorMessage.includes("Meeting has ended") || errorMessage.toLowerCase().includes("connection")) {
                    errorMessage = "Connection Failed - Internet Issue";
                    isConnectionError = true;
                }
            }
            
            console.error("Parsed error message:", errorMessage);
            setIsInterviewActive(false);
            setIsConnecting(false);
            hasStartedCall.current = false;
            
            if (isConnectionError) {
                toast.error(errorMessage + " Please reload the page (F5) and try again.", { 
                    duration: 8000,
                    action: {
                        label: 'Reload',
                        onClick: () => window.location.reload()
                    }
                });
            } else {
                toast.error(errorMessage, { duration: 10000 });
            }
            
            setTimeout(() => {
                setShowStartButton(true);
                setReadyToStart(true);
            }, 1000);
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
            firstMessage: "Hi "+user?.fullName+", how are you? Ready for your interview on "+(InterviewQuestions?.jobTitle || "Software Engineer")+"?",
            transcriber: {
                provider: "deepgram",
                model: "nova-2",
                language: "en-US",
            },
            voice: {
                provider: "playht",
                voiceId: "jennifer",
            },
            model: {
                provider: "openai",
                model: "gpt-4o",  
               
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
✅ Ask EXACTLY 10 questions - count them carefully and also need to ask about projects after 6 question
✅ Be friendly, engaging, and witty 🎤
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ ALWAYS provide performance feedback after ALL questions are done
✅ Make the candidate feel comfortable and supported throughout
✅ Make sure your are strict in interview in asking questions and also in time limit
✅ if candiate is not answering well say him or her to improve in that area
✅ Be like a human interviewer
✅ After the final question's answer, immediately give your performance summary and end the interview
`.trim(),
                    },
                ],
            },
        };
   
      
        if (!vapiRef.current) {
            console.error('❌ Vapi instance not initialized');
            toast.error('Voice interface not ready. Please refresh the page.');
            hasStartedCall.current = false;
            return;
        }
        
        if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
            console.error('❌ VAPI_PUBLIC_KEY not configured');
            toast.error('Voice service not configured. Please contact support.');
            hasStartedCall.current = false;
            return;
        }
        
        console.log('📞 Initiating Vapi call...');
        console.log('Assistant options configured:', {
            name: assistantOptions.name,
            hasFirstMessage: !!assistantOptions.firstMessage,
            transcriber: assistantOptions.transcriber.provider,
            voice: assistantOptions.voice.provider,
            model: assistantOptions.model.provider,
            modelName: assistantOptions.model.model
        });
        

        try {
            // @ts-ignore
            const startPromise = vapiRef.current.start(assistantOptions);
            console.log('✅ Vapi start() called successfully');
            
           
            if (startPromise && typeof startPromise.then === 'function') {
                startPromise.catch((err: any) => {
                    console.error('❌ Vapi start promise rejected:', err);
                    toast.error('Failed to connect: ' + (err.message || 'Unknown error'));
                    setIsInterviewActive(false);
                    hasStartedCall.current = false;
                });
            }
        } catch (error: any) {
            console.error('❌ Failed to start Vapi call:', error);
            console.error('Error type:', typeof error);
            console.error('Error keys:', Object.keys(error || {}));
            toast.error('Failed to start interview: ' + (error.message || 'Unknown error'));
            setIsInterviewActive(false);
            hasStartedCall.current = false;
        }
    }



    const Resultsdata = async() => {
        try {
            const result = await convex.query(api.Result.GetResults, {
                // @ts-ignore
                resultRecordId: interviewId
            })

            console.log("Result Data:", result)
            setResultsdata(result)
        } catch (error) {
            console.log("No existing results found (this is normal for new interviews):", error)
            
        }
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
                
                
                delete reportData.final_score;
                delete reportData.overall_performance;
                delete reportData.reason_for_deduction;
                delete reportData.question_wise_justification;
                
                if (reportData.justification && !reportData.questionWiseJustification) {
                    reportData.questionWiseJustification = reportData.justification;
                }
                delete reportData.justification;
                
               
                if (reportData.overall_evaluation && typeof reportData.overall_evaluation === 'object') {
                    const evalObj = reportData.overall_evaluation;
                    
                    
                    if (evalObj.strengths && !reportData.strengths) {
                        reportData.strengths = evalObj.strengths;
                    }
                    
                 
                    if (evalObj.weaknesses_improvement_areas && !reportData.weaknesses) {
                        reportData.weaknesses = evalObj.weaknesses_improvement_areas;
                    }
                }
                
                
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
                
                console.log("Report data after extraction and cleanup:", reportData);
                
               
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

    
    if (isLoading || !userDetails || !user || !InterviewQuestions || !micPermissionGranted || !vapiReady) {
        let loadingMessage = 'Initializing Interview...';
        let subMessage = 'Please wait while we set up your session';
        let icon = '⚙️';
        
        if (!micPermissionGranted) {
            loadingMessage = 'Requesting Microphone Permission...';
            subMessage = 'Please allow microphone access to continue';
            icon = '🎤';
        } else if (!vapiReady) {
            loadingMessage = 'Setting up voice interface...';
            subMessage = 'Preparing your interview session';
            icon = '🔧';
        }
        
        return (
            <div className='p-20 lg:px-48 xl:px-56'>
                <div className='flex flex-col items-center justify-center h-[500px]'>
                    <div className='relative mb-8'>
                        <div className='animate-spin rounded-full h-20 w-20 border-4 border-primary/30 border-t-primary'></div>
                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl'>
                            {icon}
                        </div>
                    </div>
                    <h2 className='text-2xl font-bold text-foreground mb-2'>
                        {loadingMessage}
                    </h2>
                    <p className='text-muted-foreground'>
                        {subMessage}
                    </p>
                    <div className='mt-6 flex gap-2'>
                        <div className='w-3 h-3 bg-primary rounded-full animate-bounce'></div>
                        <div className='w-3 h-3 bg-primary rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                        <div className='w-3 h-3 bg-primary rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='p-20 lg:px-48 xl:px-56'>
            {/* Connection Error Popup */}
            {showConnectionError && (
                <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200'>
                    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full p-8 relative border-4 border-red-500 animate-in zoom-in slide-in-from-top duration-300'>
                        <button 
                            onClick={() => setShowConnectionError(false)}
                            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                        >
                            <X className='h-6 w-6' />
                        </button>
                        
                        <div className='flex flex-col items-center text-center mb-6'>
                            <div className='bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4 animate-pulse'>
                                <AlertCircle className='h-16 w-16 text-red-600 dark:text-red-400' />
                            </div>
                            <h2 className='text-3xl font-bold text-red-600 dark:text-red-400 mb-2'>
                                Connection Failed!
                            </h2>
                            <p className='text-xl font-semibold text-gray-700 dark:text-gray-300'>
                                Internet Connection Issue Detected
                            </p>
                        </div>
                        
                        <div className='bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 mb-6'>
                            <div className='flex items-start gap-3 mb-4'>
                                <RefreshCw className='h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0' />
                                <div>
                                    <h3 className='text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2'>
                                        📋 How to Fix This Issue:
                                    </h3>
                                    <ol className='text-yellow-900 dark:text-yellow-100 space-y-2 text-sm'>
                                        <li className='flex items-start gap-2'>
                                            <span className='font-bold text-lg'>1.</span>
                                            <span><strong>Reload this page</strong> (Press F5 or Ctrl+R / Cmd+R)</span>
                                        </li>
                                        <li className='flex items-start gap-2'>
                                            <span className='font-bold text-lg'>2.</span>
                                            <span>Wait for the page to fully load</span>
                                        </li>
                                        <li className='flex items-start gap-2'>
                                            <span className='font-bold text-lg'>3.</span>
                                            <span>Click <strong>"Start Interview"</strong> button again</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                            
                            <div className='bg-white dark:bg-gray-700 rounded-lg p-4 mt-4 border-l-4 border-green-500'>
                                <p className='text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2'>
                                    <span className='text-2xl'>✅</span>
                                    <span>This works 100% of the time for new users!</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className='flex flex-col gap-3'>
                            <button
                                onClick={() => window.location.reload()}
                                className='w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3'
                            >
                                <RefreshCw className='h-6 w-6' />
                                Reload Page Now
                            </button>
                            <button
                                onClick={() => setShowConnectionError(false)}
                                className='w-full px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Popup for First-Time Users */}
            {showWelcomePopup && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-300'>
                        <button 
                            onClick={handleCloseWelcomePopup}
                            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                        >
                            <X className='h-6 w-6' />
                        </button>
                        
                        <div className='flex items-start gap-4 mb-6'>
                            <div className='bg-primary/10 p-3 rounded-full'>
                                <AlertCircle className='h-8 w-8 text-primary' />
                            </div>
                            <div className='flex-1'>
                                <h2 className='text-2xl font-bold text-foreground mb-2'>
                                    Welcome to Your AI Interview! 🎙️
                                </h2>
                                <p className='text-muted-foreground text-lg'>
                                    Before you begin, please read these important instructions:
                                </p>
                            </div>
                        </div>
                        
                        <div className='space-y-4 mb-6'>
                            <div className='bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded'>
                                <div className='flex items-start gap-3'>
                                    <AlertCircle className='h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0' />
                                    <div>
                                        <h3 className='font-semibold text-yellow-900 dark:text-yellow-200 mb-1'>
                                            ⚠️ First-Time Users: Connection Tips
                                        </h3>
                                        <p className='text-yellow-800 dark:text-yellow-300 text-sm'>
                                            If the connection fails on your first attempt, simply <span className='font-bold'>reload the page (F5)</span> and click 
                                            "Start Interview" again. <span className='font-bold'>This works 100% of the time!</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='bg-primary/5 border-l-4 border-primary p-4 rounded'>
                                <h3 className='font-semibold text-foreground mb-2'>✅ Before You Start:</h3>
                                <ul className='text-muted-foreground text-sm space-y-2'>
                                    <li className='flex items-start gap-2'>
                                        <span className='font-bold mt-0.5'>•</span>
                                        <span>Grant microphone permission when prompted</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='font-bold mt-0.5'>•</span>
                                        <span>Ensure you're in a quiet environment</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='font-bold mt-0.5'>•</span>
                                        <span>You have 10 minutes to complete the interview</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='font-bold mt-0.5'>•</span>
                                        <span>Speak clearly and answer all questions thoughtfully</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className='bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded'>
                                <h3 className='font-semibold text-green-900 dark:text-green-200 mb-2'>💡 Pro Tips:</h3>
                                <ul className='text-green-800 dark:text-green-300 text-sm space-y-2'>
                                    <li className='flex items-start gap-2'>
                                        <span className='font-bold mt-0.5'>•</span>
                                        <span>Wait for the AI to finish asking before answering</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='font-bold mt-0.5'>•</span>
                                        <span>Use the red phone button to end the interview when done</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='font-bold mt-0.5'>•</span>
                                        <span>If you face issues, refresh and restart</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className='flex gap-3 justify-end'>
                            <button
                                onClick={handleCloseWelcomePopup}
                                className='px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2'
                            >
                                Got it! Let's Start
                                <span className='text-xl'>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <h2 className='flex font-bold text-2xl justify-between text-foreground'> 
                <span className='flex items-center gap-2'>
                    🎙️ AI Interview Session
                </span>
                <span className={`flex gap-2 items-center font-mono ${
                    timeRemaining < 60 
                        ? 'text-destructive animate-pulse' 
                        : timeRemaining < 180 
                        ? 'text-orange-500 dark:text-orange-400' 
                        : 'text-green-600 dark:text-green-400'
                }`}>
                    <Timer className='h-5 w-5' />
                    {formatTime(timeRemaining)}
                </span>
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-6'>
                <div className='bg-card border-2 border-border h-[400px] rounded-xl shadow-lg flex flex-col items-center justify-center transition-all hover:shadow-xl'>
                    <div className='relative'>
                       {!userActive && (
                           <>
                               <span className='absolute inset-0 rounded-full bg-primary/30 opacity-75 animate-ping' />
                               <span className='absolute inset-0 rounded-full bg-primary/20 opacity-50 animate-pulse' />
                           </>
                       )}
                       <div className='relative rounded-full border-4 border-primary/30 p-1'>
                           <Image 
                               src={'/ai9.png'} 
                               alt='AI Image' 
                               width={100} 
                               height={100} 
                               className='w-[80px] h-[80px] rounded-full object-cover' 
                           />
                       </div>
                    </div>
                    <h2 className='mt-4 font-bold text-xl text-foreground'>AI Recruiter</h2>
                    <p className='text-sm text-muted-foreground mt-1'>
                        {!userActive ? '🎤 Speaking...' : '⏸️ Listening...'}
                    </p>
                </div>

                <div className='bg-card border-2 border-border h-[400px] rounded-xl shadow-lg flex flex-col items-center justify-center transition-all hover:shadow-xl'>
                    <div className='relative'>
                       {userActive && (
                           <>
                               <span className='absolute inset-0 rounded-full bg-green-500/30 opacity-75 animate-ping' />
                               <span className='absolute inset-0 rounded-full bg-green-500/20 opacity-50 animate-pulse' />
                           </>
                       )}
                       <div className='relative rounded-full border-4 border-muted p-1'>
                           <Image 
                               src={user?.imageUrl || '/ai7.png'} 
                               alt='User Image' 
                               width={100} 
                               height={100} 
                               className='w-[80px] h-[80px] rounded-full object-cover' 
                           />
                       </div>
                    </div>
                    <h2 className='mt-4 font-bold text-xl text-foreground'>{user?.fullName || 'Candidate'}</h2>
                    <p className='text-sm text-muted-foreground mt-1'>
                        {userActive ? '🎤 Speaking...' : '⏸️ Listening...'}
                    </p>
                </div>
            </div>

            
            {showStartButton && !isInterviewActive && !isConnecting ? (
                <div className='flex flex-col items-center justify-center gap-5 mt-6'>
                    <button 
                        onClick={handleStartInterview}
                        disabled={!vapiReady || !micPermissionGranted || isConnecting}
                        className={`px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-3 ${
                            !vapiReady || !micPermissionGranted || isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Phone className='h-6 w-6' />
                        Start Interview
                    </button>
                    <p className='text-muted-foreground text-sm'>
                        {!micPermissionGranted 
                            ? '⚠️ Microphone permission required' 
                            : !vapiReady 
                            ? '⏳ Preparing voice interface...' 
                            : 'Click to begin your AI interview session'}
                    </p>
                    <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4 max-w-2xl'>
                        <p className='text-blue-800 dark:text-blue-200 text-sm font-medium flex items-center gap-2'>
                            <AlertCircle className='h-4 w-4' />
                            <span className='font-bold'>First time starting?</span>
                        </p>
                        <p className='text-blue-700 dark:text-blue-300 text-xs mt-1'>
                            If connection fails, simply reload (F5) and try again. Works 100%!
                        </p>
                    </div>
                </div>
            ) : isInterviewActive ? (
                <>
                    <div className='flex items-center justify-center gap-5 mt-6'>
                        <Mic className='h-12 w-12 p-3 bg-muted hover:bg-muted/80 text-foreground rounded-full cursor-pointer transition-all' />
                        <AppDialog stopinterview={() => stopInterview()}>
                            <Phone className='h-12 w-12 p-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full cursor-pointer transition-all' />
                        </AppDialog>
                    </div>
                    <div className='text-center mt-4'>
                        <p className='text-muted-foreground text-lg animate-pulse'>Interview in progress...</p>
                    </div>
                </>
            ) : isConnecting ? (
                <div className='flex flex-col items-center justify-center gap-5 mt-6'>
                    <div className='relative'>
                        <div className='animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary'></div>
                        <Phone className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary' />
                    </div>
                    <p className='text-foreground text-lg font-semibold'>Connecting to interview...</p>
                    <p className='text-muted-foreground text-sm mt-2 max-w-md text-center'>
                        Please wait while we establish the connection
                    </p>
                    <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-2 max-w-md'>
                        <p className='text-amber-800 dark:text-amber-200 text-xs text-center'>
                            💡 If this takes too long, a reload prompt will appear automatically
                        </p>
                    </div>
                </div>
            ) : null}

        </div>
    )
}

export default Startinterview