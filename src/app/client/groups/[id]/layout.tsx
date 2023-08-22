"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";

import { GroupSidebar } from "@/components/sidebar/GroupSidebar";

import { useGroup } from "../group"
import { usePathname } from "next/navigation";

import { GroupDetails } from "@/util/db/group";
import { User } from "@prisma/client";
import toast from "react-hot-toast";

export default function GroupLayout({ children }: {
    children: React.ReactNode
}) {
    const group = useGroup();
    const path = usePathname();

    const response = useSWR(`/api/groups/${path.split("/")[3]}`, fetch);

    useEffect(() => {
        if (
            !response.isLoading
            && response.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await response.data?.json();
                    if (body.group && group.setGroup) {
                        group.setGroup(body.group as GroupDetails);
                    }

                    if (body.owner && group.setOwner) {
                        group.setOwner(body.owner as User);
                    }

                    if (body.user && group.setUser) {
                        group.setUser(body.user);
                    }
                } catch (error) {

                }
            }

            tryJson();
        } else if (response.error) {
            toast.error("Error loading group data");
        }
    }, [response]);

    return (
        <div>
            <div
                className="flex flex-row"
            >
                <GroupSidebar />
                <div
                    className="flex flex-col h-screen p-8 w-[-webkit-fill-available] bg-indigo-100 overflow-y-auto"
                >{children}</div>
            </div >
        </div>
    )
}