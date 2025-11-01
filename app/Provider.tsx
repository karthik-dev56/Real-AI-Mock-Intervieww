"use client"
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import React, { createContext, use } from 'react'
import { useUser } from '@clerk/nextjs'
import { useEffect,useState } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'

function Provider({children}: any) {
  const {user} = useUser();
  const CreateUser = useMutation(api.users.CreateNewUser);
  const [userDetails, setUserDetails] = useState<any>();

  useEffect(() => {
    user && CreateNewUser();
  }, [user]);

  const CreateNewUser = async () => {
    if(user) {
      const result = await CreateUser({
        email:user?.primaryEmailAddress?.emailAddress??'',
        imageUrl:user?.imageUrl??'',
        name:user?.fullName??''
      });
      console.log(result);
      setUserDetails(result);
      console.log(userDetails);
    }
  }
  
  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  )
}

export default Provider;

export const useUserDetailContext = () => {
  return createContext(UserDetailContext);
}