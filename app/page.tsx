
import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroSection from "./_components/heroSection";
import Header from "./_components/header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {

  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }
  
  return (
    <div>
      <Header />
      <HeroSection />
    </div>
  );
}
