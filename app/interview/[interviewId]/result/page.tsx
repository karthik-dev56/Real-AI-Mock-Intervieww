"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2Icon, Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ResultsPDF } from './_components/ResultsPDF';
import { useUser } from '@clerk/nextjs';

type ResultData = {
    conclusion?: string;
    finalScore?: number;
    overallEvaluation?: string;
    reasonForDeduction?: string;
    strengths?: string;
    weakness?: string;
    _id: string;
}

function InterviewResult() {
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const { interviewId } = useParams();
    const convex = useConvex();
    const router = useRouter();
    const[loading,setLoading]=useState(false)
    const { user } = useUser();

    useEffect(() => {
        getResultData();
    }, [interviewId]);

    const getResultData = async () => {
        try {
            setLoading(true);
            const result = await convex.query(api.Result.GetResults, {
                // @ts-ignore
                resultRecordId: interviewId
            });
            console.log("Result Data:", result);
            setResultData(result);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching result:", error);
            setLoading(false);
        }
    };

    if (!resultData) {
        return (
           <div className="flex items-center justify-center min-h-screen">
               {loading && <Loader2Icon className='animate-spin h-12 w-12' />}
           </div>
        );
    }

    const Iscall = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        router.push('/dashboard');
    }

    const handleDownloadPDF = async () => {
        if (!resultData) return;
        
        try {
            setLoading(true);
            const userName = user?.fullName || user?.firstName || 'Unknown User';
            const blob = await pdf(
                <ResultsPDF 
                    resultData={resultData} 
                    userName={userName}
                    interviewDate={new Date()}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${userName}-${Date.now().toString()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            setLoading(false);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setLoading(false);
        }
    }

    return (
        <div className="p-10 lg:px-32 xl:px-48">
            {loading && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <Loader2Icon className='animate-spin h-12 w-12 text-white' />
                </div>
            )}
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Interview Results</h1>
                
                <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            
                    
                    <div className="bg-gray-50 rounded-lg p-4 border-b">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">
                                <span className="font-semibold">Candidate:</span> {user?.fullName || user?.firstName || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Interview Date: {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="text-center border-b pb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Final Score</h2>
                        <p className="text-5xl font-bold text-blue-600">
                            {resultData.finalScore || 0}/20
                        </p>
                    </div>

                    
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Overall Evaluation</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">
                            {resultData.overallEvaluation || "No evaluation available"}
                        </p>
                    </div>

                  
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold text-green-700 mb-3">Strengths</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">
                            {resultData.strengths || "Not available"}
                        </p>
                    </div>

                   
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold text-orange-700 mb-3">Areas for Improvement</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">
                            {resultData.weakness || "Not available"}
                        </p>
                    </div>

                 
                    {resultData.reasonForDeduction && (
                        <div className="border-b pb-6">
                            <h3 className="text-lg font-semibold text-red-700 mb-3">Reason for Deduction</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {resultData.reasonForDeduction}
                            </p>
                        </div>
                    )}

            
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Conclusion</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">
                            {resultData.conclusion || "Not available"}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center pt-6">
                        
                        <Button
                            onClick={() => Iscall()}
                            variant="default"
                        >
                            Back to Dashboard
                        </Button>
                        <Button 
                            onClick={handleDownloadPDF}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewResult;
