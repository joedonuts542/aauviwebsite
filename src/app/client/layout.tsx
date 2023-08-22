"use client";

import useSWR from "swr";

import { Sidebar } from "@/components/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth";
import { useEffect } from "react";

import { User } from "@prisma/client";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();

    const { data, error, isLoading } = useSWR("/api/context", fetch);
    if (error) {
        router.replace("/auth/login");
    };

    useEffect(() => {
        if (data && !auth.user) {
            const tryJson = async () => {
                try {
                    const body = await data.json();
                    if (body && body.data && auth.setUser) {
                        auth.setUser(body.data as User)
                    } else if (body && body.error) {
                        router.replace("/auth/login");
                    }
                } catch (error) {

                }
            }

            tryJson()
        }
    }, [isLoading, data])

    return (
        <div>
            {
                (pathname.includes("groups") || pathname.includes("apps"))
                    ? <>{children}</>
                    : <div
                        className="flex flex-row"
                    >
                        <Sidebar />
                        <div
                            className="flex flex-col h-screen p-8 w-[-webkit-fill-available] bg-indigo-100 overflow-y-auto"
                        >{children}</div>
                    </div >
            }
        </div>
    )
}