import React,{createContext, useContext, useState} from 'react'
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResumeUpload from './ResumeUpload';
import JobDescription from './JobDescription';
import { DialogClose } from '@radix-ui/react-dialog';
import axios from 'axios';
import { Loader2Icon } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { create } from 'domain';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useRouter } from 'next/navigation';
function CreateInterviewDialog() {
    const[formdata,setFormData]=useState<any>()
    const[file,setFiles]=useState<File|null>()
    const[loading,setLoading]=useState(false)
    const {userDetails, setUserDetails} = useContext(UserDetailContext);

    const saveInterviewQuestions=useMutation(api.interview.SaveInterview)

    const router = useRouter();

    const onHandleInputChange=(field:string,value:string)=> {
          setFormData((prev:any)=> ({
            ...prev,
            [field]:value
          }))
    }
    
 
    
    const hasFile = !!file;
    const hasJobDetails = formdata?.jobTitle?.trim() && formdata?.jobDescription?.trim();
    const hasUserDetails = !!userDetails?._id;
    const isFormValid = (hasFile || hasJobDetails) && hasUserDetails;


    const onSubmit=async()=> {
     
        setLoading(true);

        // Check if userId exists before proceeding
        if (!userDetails?._id) {
            toast.error("User information not available. Please try again.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file',file || '');
        formData?.append('jobTitle',formdata?.jobTitle),
        formData?.append('jobDescription',formdata?.jobDescription)

        try {
            const res = await axios.post('api/generate-ai-questions',formData);
            console.log(res.data)
            if(res.data.status==429){
                toast.warning("You have exceeded your rate limit. Please try again after 24hrs.");
                return
            }
            const resp = await saveInterviewQuestions({
                interviewQuestions:res.data.questions,
                resumeUrl:res.data.resumeUrl || "",
                userId:userDetails._id,
                jobTitle:formdata?.jobTitle || "",
                jobDescription:formdata?.jobDescription || "",
                status: "draft" 
            })
            router.push('/interview/'+resp)
        }catch(e) {
            console.log(e)
            toast.error("Failed to create interview. Please try again.");
        }finally {
            setLoading(false);
        }
    }
    return (
        <Dialog>
            <DialogTrigger><Button>+ Create Interview</Button></DialogTrigger>
            <DialogContent className='min-w-3xl'>
                <DialogHeader>
                    <DialogTitle>Choose Interview Type</DialogTitle>
                    <DialogDescription>
                        <Tabs defaultValue="job-description" className="w-full mt-2">
                            <TabsList>
                                <TabsTrigger value="job-description">Job Description</TabsTrigger>
                                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                              
                            </TabsList>
                            <TabsContent value="resume-upload"><ResumeUpload setFiles={(file:File) => setFiles(file)} /></TabsContent>
                            <TabsContent value="job-description"><JobDescription onHandleInputChange={onHandleInputChange} /></TabsContent>
                            
                        </Tabs>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='flex gap-5'>
                    <DialogClose>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={onSubmit} disabled={loading || !isFormValid}>
                        {loading && <Loader2Icon className='animate-spin'/>}
                        Submit</Button>
                    
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateInterviewDialog