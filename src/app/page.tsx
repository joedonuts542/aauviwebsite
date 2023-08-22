import Image from 'next/image';
import Link from 'next/link';

import {
  HiUsers,
  HiTrendingUp,
  HiHeart
} from "react-icons/hi";

export default function Home() {
  return (
    <div
      className="relative flex flex-col p-0 m-0 bg-indigo-50 h-screen w-screen overflow-y-auto overflow-x-hidden overscroll-none"
    >
      <Image
        width={3000}
        height={1705}
        className="absolute block top-0 min-w-[1500px] mx-auto object-center z-[1]"
        src={"/static/LandingPage.svg"}
        alt="landing"
      />
      <div
        className="flex flex-row justify-between px-12 md:px-32 lg:px-60 py-10 w-full z-[5]"
      >
        <div
          className="my-auto mx-auto md:mx-0"
        >
          <Image
            width={256}
            height={256}
            className={"w-24 h-24 object-contain"}
            src={"/branding/TransparentBoltTextLight.png"}
            alt="logo"
          />
        </div>
        <div
          className="flex-row gap-4 my-auto hidden md:flex"
        >
          <Link
            className="text-indigo-50 text-md rounded-full border-[1px] px-4 py-2 border-indigo-50 font-semibold hover:text-indigo-500 hover:bg-indigo-50 transition duration-200"
            href={"/auth/login"}
          >Login</Link>
        </div>
      </div>
      <div
        className="flex flex-col px-12 md:px-32 lg:px-60 w-full z-[5]"
      >
        <span
          className="text-indigo-50 font-bold text-lg md:text-3xl lg:text-6xl max-w-full md:max-w-[60%]"
        >Power up your groups with neuro</span>
        <span
          className="text-indigo-50 text-md max-w-full md:max-w-[60%] mt-8 mb-8"
        >The missing all-in-one company management toolkit</span>
        <Link
          className="w-fit bg-indigo-50 text-indigo-500 px-4 py-2 rounded-full font-semibold hover:shadow-md hover:text-indigo-600 transition duration-200 hidden xl:flex"
          href={"/auth/signup"}
        >Get started for free</Link>
      </div>
      <div
        className="flex flex-col xl:flex-row gap-8 px-12 md:px-32 lg:px-60 z-[5] w-fill py-20"
      >
        <div
          className="flex flex-col gap-4 p-8 bg-indigo-50 shadow-md hover:shadow-lg transition duration-200 rounded-md w-full my-auto"
        >
          <div
            className="flex flex-col w-12 h-12 rounded-full bg-indigo-500 shadow-md text-indigo-50"
          >
            <HiUsers 
              className="mx-auto my-auto"
            />
          </div>
          <span
            className="text-indigo-950 text-lg font-semibold"
          >Human Resources</span>
          <span
            className="text-indigo-950 text-sm"
          >Track your employee activity, set requirements, assign tasks, and organize departments.</span>
          <span
            className="text-indigo-950 text-xs"
          >Coming late 2023</span>
        </div>
        <div
          className="flex flex-col p-8 gap-4 bg-indigo-50 shadow-md hover:shadow-lg transition duration-200 rounded-md w-full my-auto"
        >
          <div
            className="flex flex-col w-12 h-12 rounded-full bg-indigo-500 shadow-md text-indigo-50"
          >
            <HiTrendingUp 
              className="mx-auto my-auto"
            />
          </div>
          <span
            className="text-indigo-950 text-lg font-semibold"
          >Complex Analytics & Goals</span>
          <span
            className="text-indigo-950 text-sm"
          >Monitor game performance, manage development workflows, set player goals, and plan events.</span>
          <span
            className="text-indigo-950 text-xs"
          >In development</span>
        </div>
        <div
          className="flex flex-col p-8 gap-4 bg-indigo-50 shadow-md hover:shadow-lg transition duration-200 rounded-md w-full my-auto"
        >
          <div
            className="flex flex-col w-12 h-12 rounded-full bg-indigo-500 shadow-md text-indigo-50"
          >
            <HiHeart 
              className="mx-auto my-auto"
            />
          </div>
          <span
            className="text-indigo-950 text-lg font-semibold"
          >Strengthen Partnerships</span>
          <span
            className="text-indigo-950 text-sm"
          >Set partnership activity goals, contact representatives, and handle applications.</span>
          <span
            className="text-indigo-950 text-xs"
          >Coming early 2024</span>
        </div>
      </div>
      <div
        className="flex flex-col gap-4 justify-center text-center px-12 md:px-32 lg:px-60 z-[5] w-full py-20"
      >
        <span
          className="text-indigo-950 font-bold text-2xl"
        >Follow our Development</span>
        <span
          className="text-indigo-950 text-md"
        >Join our{" "}
          <a
            className="text-indigo-500 hover:text-indigo-600"
            href="https://discord.gg/GrGxmX6FCC"
          >Discord Server</a>
        </span>
      </div>
    </div>
  )
}
