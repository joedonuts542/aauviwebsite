"use client";

import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "../../../../auth";
import { useGroup } from "../../../group";

import { toast } from "react-hot-toast";

import { MoonLoader } from "react-spinners";

import { Logo } from "@/components/content/Logo";
import { GroupMessages } from "@/components/client/GroupMessages";
import { Dropdown } from "@/components/form/Dropdown";
import { GroupHeader } from "@/components/client/GroupHeader";
import { GroupEmployees } from "@/components/client/GroupEmployees";

export default function UserPage() {
    const router = useRouter();
    const group = useGroup();
    const path = usePathname();
    const auth = useAuth();

    const [loading, setLoading] = useState<boolean>(false);
    const userCache = useSWR(
        () => {
            return path.split("/")[5] && group.group ? `/api/groups/${group.group.id}/users/roblox/${path.split("/")[5]}` : null
        },
        fetch
    );

    useEffect(() => {
        if (!userCache.isLoading
            && userCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await userCache.data?.json();
                    if (body.user) {
                        router.prefetch(`/client/groups/${group.group!.id}/profile/${body.user}`)
                        router.replace(`/client/groups/${group.group!.id}/profile/${body.user}`)
                    } else {
                        toast.error(body.error)
                    }

                    setLoading(false);
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [userCache])

    return (
        !loading
    ) ? (
        <div
            className="flex flex-col gap-12"
        >
            
        </div>
    ) : (
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