import React, { Children } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
function AppDialog({children,stopinterview}:any) {
  return (
    <AlertDialog>
  <AlertDialogTrigger>{children}</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>End Interview Early?</AlertDialogTitle>
      <AlertDialogDescription>
        ⚠️ Warning: Ending the interview before time is up will result in a 15% score reduction penalty. 
        Your interview will be evaluated based on the questions answered so far.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() =>stopinterview()} className="bg-red-600 hover:bg-red-700">End Interview</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
  )
}


export default AppDialog