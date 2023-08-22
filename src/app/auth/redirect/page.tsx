"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { MoonLoader } from "react-spinners";
import { toast } from "react-hot-toast";

export default function RedirectPage () {
    const router = useRouter();
    const params = useSearchParams();
    useEffect(() => {
        fetch(
            `/api/auth/validate?${params.toString()}`
        ).then(async (response) => {
            let body;
            try {
                body = await response.json();
            } catch (error) {

            }

            if (response.status === 200) {
                router.replace("/client");
            } else if (body) {
                setTimeout(() => {
                    router.replace("/auth/login")
                }, 4000);
    
                toast.error(body.error);
            } else {
                setTimeout(() => {
                    router.replace("/auth/login")
                }, 4000);
    
                toast.error("Unable to complete authentication");
            }
        }).catch((error) => {
            setTimeout(() => {
                router.replace("/auth/login")
            }, 4000);

            toast.error("Unable to complete authentication");
        })
    }, [])

    return (
        <div
            className="flex flex-col w-screen h-screen bg-indigo-100"
        >
            <MoonLoader
                size={48}
                className={"flex mx-auto my-auto"}
                color={"#6366f1"}
            />
        </div>
    )
}