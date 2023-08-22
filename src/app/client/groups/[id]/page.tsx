"use client";

import useSWR from "swr";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "../../auth";

import { GroupDetails, GroupMessageDetails } from "@/util/db/group";
import { User } from "@prisma/client";

import { toast } from "react-hot-toast";

import {
    HiChatAlt,
    HiDotsVertical,
    HiTrash
} from "react-icons/hi";
import { MoonLoader } from "react-spinners";
import { Logo } from "@/components/content/Logo";
import { GroupMessages } from "@/components/client/GroupMessages";
import { Dropdown } from "@/components/form/Dropdown";
import { useGroup } from "../group";
import { GroupHeader } from "@/components/client/GroupHeader";

export default function GroupPage() {
    const group = useGroup();
    const path = usePathname();
    const auth = useAuth();

    const [load, setLoad] = useState<number>(0);

    const [messages, setMessages] = useState<GroupMessageDetails[]>([]);

    const [version, setVersion] = useState<number>(0);
    useEffect(() => {
        fetch(
            `/api/groups/${path.split("/")[3]}/messages${load > 0 ? `?skip=${load}` : ``}`
        ).then(async (data) => {
            try {
                const body = await data.json();
                if (data.status === 200) {
                    const result = [ ...messages ];
                    body.messages.forEach((m: GroupMessageDetails) => {
                        if (result.findIndex(r => r.id === m.id) < 0) {
                            result.push(m);
                        }
                    })
                    
                    setMessages(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                } else {
                    toast.error(
                        body.error || "Error loading group messages"
                    )
                }
            } catch (error) {

            }
        }).catch((error) => {
            toast.error("Error loading group messages");
        })
    }, [group, load, version]);

    return (
        group.group && group.owner
    ) ? (
        <div
            className="flex flex-col gap-12"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <GroupMessages
                group={group.group}
                messages={messages}
                setLoad={setLoad}
                reload={() => {
                    setVersion(version + 1);
                }}
            />
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