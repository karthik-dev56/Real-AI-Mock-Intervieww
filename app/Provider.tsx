"use client"
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import React, { createContext, use } from 'react'
import { useUser } from '@clerk/nextjs'
import { useEffect,useState } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'

function Provider({children}: any) {
  const {user, isLoaded} = useUser();
  const CreateUser = useMutation(api.users.CreateNewUser);
  const [userDetails, setUserDetails] = useState<any>();
  const [isLoading, setIsLoading] = useState(!isLoaded);

  useEffect(() => {
    console.log('Provider - isLoaded:', isLoaded, 'user:', user?.id, 'isLoading:', isLoading);
    if (isLoaded && user) {
      CreateNewUser();
    } else if (isLoaded && !user) {
      setIsLoading(false);
      console.log('No user, setting isLoading to false');
    }
  }, [user, isLoaded]);

  const CreateNewUser = async () => {
    if(user) {
      setIsLoading(true);
      console.log('Creating/fetching user...');
      try {
        const result = await CreateUser({
          email:user?.primaryEmailAddress?.emailAddress??'',
          imageUrl:user?.imageUrl??'',
          name:user?.fullName??''
        });
        
        const normalizedUser = (result as any).result 
          ? { ...result, _id: (result as any).result }
          : result; 
        
        setUserDetails(normalizedUser);
        console.log('User details loaded:', normalizedUser);
        console.log('Setting isLoading to false');
      } catch (error) {
        console.error('Error creating user:', error);
      } finally {
        setIsLoading(false);
        console.log('isLoading is now false');
      }
    }
  }
  
  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails, isLoading }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  )
}

export default Provider;

export const useUserDetailContext = () => {
  return createContext(UserDetailContext);
}