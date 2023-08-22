"use client";

import { MoonLoader } from "react-spinners";
import { useAuth } from "../../auth";

import { SubmitApp } from "@/components/client/application/SubmitApp";

export default function Page() {
    const auth = useAuth();

    return auth.user
        ? (
            <div
                className="flex flex-col bg-indigo-100 w-screen h-screen overflow-y-auto py-24 px-24 sm:px-36 md:px-64 xl:px-[26rem]"
            >
                <SubmitApp />
            </div>
        )
        : (
            <div
                className="w-full h-screen"
            >
                <MoonLoader
                    size={32}
                    className={"flex mx-auto my-auto"}
                    color={"#6366f1"}
                />
            </div>
        )
}