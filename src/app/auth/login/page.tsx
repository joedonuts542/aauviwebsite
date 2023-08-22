"use client";

import useSWR from "swr"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

export default function SignupPage () {
    const router = useRouter();
    const authCheck = useSWR("/api/context", fetch);
    useEffect(() => {
        if (!authCheck.isLoading
            && authCheck.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await authCheck.data?.json();
                    if (body.data) {
                        router.replace("/client");
                    }
                } catch (error) {

                }
            }
            
            tryJson();
        }
    }, [authCheck]);

    const response = useSWR("/api/auth", fetch);
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        if (!response.isLoading && response.data) {
            const tryJson = async () => {
                try {
                    const body = await response.data!.json();
                    setUrl(body.data as string);
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [response])

    return (
        <div
            className="relative flex flex-col w-screen h-screen bg-indigo-100 overflow-y-hidden"
        >
            <Image
                width={3000}
                height={600}
                className="absolute hidden xl:flex min-w-screen z-[1]"
                src={"/static/LoginPage.svg"}
                alt="background"
            />
            <div
                className="flex flex-col mx-auto my-auto z-[5] bg-indigo-50 rounded-md shadow-md p-4 w-96"
            >
                <span
                    className="text-indigo-950 text-xl font-bold mb-2"
                >Login</span>
                <span
                    className="text-indigo-950 text-sm mb-8"
                >
                    You will be redirected to Roblox to authorize your account with{" "}
                    <span
                        className="text-indigo-500"
                    >neuro</span>
                </span>
                <span
                    className="text-indigo-950 text-sm mb-4"
                >Don&apos;t have an acount?{" "} 
                    <Link
                        className="text-indigo-500 font-semibold"
                        href="/auth/signup"
                    >Create One</Link>
                </span>
                <a
                    className="bg-indigo-500 py-1 rounded-full w-full text-center shadow-md hover:shadow-lg hover:bg-indigo-600 text-indigo-50 transition duration-200"
                    href={url}
                >Login with Roblox</a>
            </div>
        </div>
    )
}