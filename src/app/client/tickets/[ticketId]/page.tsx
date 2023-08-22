"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../../auth";

import { GroupTicket, TicketResponse, TicketType, User } from "@prisma/client";
import toast from "react-hot-toast";
import { Avatar } from "@/components/content/Avatar";
import { HiCheck } from "react-icons/hi";
import { MoonLoader } from "react-spinners";
import { TextArea } from "@/components/form/TextInput";
import { Logo } from "@/components/content/Logo";

export type Ticket = GroupTicket & {
    responses: (TicketResponse & {
        user: User
    })[],
    group: {
        id: string,
        groupId: string,
        name: string
    },
    type: TicketType,
    user: User
};

export default function Page() {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [ticket, setTicket] = useState<Ticket>();
    const ticketCache = useSWR(
        () => {
            return `/api/tickets/${pathname.split("/")[3]}`
        },
        fetch
    );

    const [message, setMessage] = useState<string>("");
    const [lastUpload, setLastUpload] = useState<number>(0);
    const [saving, setSaving] = useState<boolean>(false);

    const post = async () => {
        if (
            !saving
            && ticket
        ) {
            setSaving(true);

            const response = await fetch(
                `/api/tickets/${ticket.id}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        message
                    })
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    ticketCache.mutate();
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            } finally {
                setSaving(false);
            }
        }
    }

    const resolve = async () => {
        if (
            !saving
            && ticket
        ) {
            setSaving(true);

            const response = await fetch(
                `/api/tickets/${ticket.id}`,
                {
                    method: "DELETE"
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    setMessage("");
                    ticketCache.mutate();
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            } finally {
                setSaving(false);
            }
        }
    }

    useEffect(() => {
        if (!ticketCache.isLoading
            && ticketCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await ticketCache.data?.json();
                    if (body.ticket) {
                        setTicket(body.ticket);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [ticketCache]);

    useEffect(() => {
        if (ticket) {
            let array = [];
            array.push(ticket.user)
            for (let i = 0; i < ticket.responses.length; i++) {
                let response = ticket.responses[i];
                let index = array.findIndex(u => u.id === response.user.id);
                if (index < 0) {
                    array.push(response.user);
                }
            };

            setUsers(array);
        }
    }, [ticket])

    return (ticket) ? (
        <div
            className="flex flex-col gap-4 w-full"
        >
            <div
                className="flex flex-col w-full bg-indigo-50 shadow-md rounded-md p-8"
            >
                <div
                    className="flex flex-row my-auto gap-8"
                >
                    <Logo
                        className="w-16 h-16 rounded-md my-auto"
                        groupId={ticket.group.groupId}
                        onError={() => (
                            <></>
                        )}
                    />
                    <div
                        className="flex flex-col my-auto"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold"
                        >{ticket.title}</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >created for {ticket.group.name} on {new Date(ticket.createdAt).toDateString()}</span>
                        <span
                            className="text-indigo-950 text-xs font-semibold mt-2"
                        >{ticket.type.name.toUpperCase()}</span>
                    </div>
                </div>
                <span
                    className="text-indigo-950 text-sm mt-4"
                >{ticket.description}</span>
            </div>
            <div
                className="flex flex-row gap-4 w-full"
            >
                <div
                    className="flex flex-col h-full gap-4 w-full"
                >
                    <div
                        className={`flex flex-col-reverse gap-4 ${ticket.isActive ? "h-[26rem]" : ""} overflow-y-auto w-full bg-indigo-50 rounded-md shadow-md p-8`}
                    >
                        {
                            ticket.responses.map(r => (
                                <div
                                    key={r.id}
                                    className={`flex ${r.user.id === auth.user?.id ? "flex-row-reverse" : "flex-row"} w-full`}
                                >
                                    <Avatar
                                        className="w-10 h-10 rounded-full mx-4 mt-2"
                                        userId={r.user.robloxId}
                                        onError={() => (
                                            <></>
                                        )}
                                    />
                                    <div
                                        className="flex flex-col gap-2"
                                    >
                                        <div
                                            className={`flex flex-col ${auth.user?.id === r.user.id ? "bg-indigo-500 text-indigo-50 shadow-md" : "bg-indigo-100 text-indigo-950 shadow-none"} p-4 rounded-md`}
                                        >
                                            <span
                                                className="text-sm w-full"
                                            >{r.message}</span>
                                        </div>
                                        <div
                                            className={`${auth.user?.id === r.user.id ? "justify-end" : ""} flex flex-row`}
                                        >
                                            <span
                                                className="text-indigo-950 text-xs"
                                            ><b>{r.user.name}</b> at {new Date(r.createdAt).toDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {
                        ticket.isActive
                        && <div
                            className="flex flex-col rounded-md shadow-md bg-indigo-50 p-8"
                        >
                            <TextArea
                                value={message}
                                helper={`${message.length}/500`}
                                onChange={(event) => {
                                    if (event.target.value.length <= 500) {
                                        setMessage(event.target.value);
                                    }
                                }}
                            />
                            <div
                                className="flex flex-row w-full justify-end"
                            >
                                <button
                                    className="text-indigo-50 text-xs font-semibold px-4 py-2 hover:bg-indigo-600 disabled:bg-indigo-700 bg-indigo-500 rounded-full transition duration-200"
                                    disabled={saving}
                                    onClick={post}
                                >SEND</button>
                            </div>
                        </div>
                    }
                </div>
                <div
                    className="flex flex-col gap-4 w-[30rem]"
                >
                    {
                        users.length > 0
                            ? users.map((u, i) => (
                                <div
                                    key={u.id}
                                    className="flex flex-row gap-4 rounded-md shadow-md bg-indigo-50 p-8"
                                >
                                    <Avatar
                                        userId={u.robloxId}
                                        onError={() => (
                                            <div
                                                className="flex flex-col w-10 h-10 rounded-md bg-indigo-100 my-auto"
                                            />
                                        )}
                                        className="w-10 h-10 rounded-md my-auto"
                                    />
                                    <div
                                        className="flex flex-col my-auto"
                                    >
                                        <span
                                            className="text-indigo-950 text-md font-semibold"
                                        >{u.name}</span>
                                        <span
                                            className="text-indigo-950 text-xs"
                                        >
                                            {
                                                Number(i) === 0
                                                    ? "Original Poster"
                                                    : "Helper"
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))
                            : <div
                                className="w-full flex flex-row"
                            >
                                <MoonLoader
                                    size={32}
                                    className={"flex mx-auto my-auto"}
                                    color={"#6366f1"}
                                />
                            </div>
                    }
                    <div
                        className="flex flex-row w-full justify-between bg-indigo-50 rounded-md shadow-md p-8"
                    >
                        <span
                            className="text-indigo-950 text-md font-semibold my-auto"
                        >Status</span>
                        {
                            ticket.isActive
                                ? <button
                                    className="px-4 py-2 text-indigo-50 text-xs font-semibold hover:bg-indigo-600 bg-indigo-500 rounded-full transition duration-200 my-auto"
                                    onClick={resolve}
                                >
                                    RESOLVE
                                </button>
                                : <span
                                    className="px-4 py-2 text-indigo-50 text-xs font-semibold bg-green-500 rounded-full my-auto"
                                >
                                    RESOLVED
                                </span>
                        }
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div
            className="w-full flex flex-row"
        >
            <MoonLoader
                size={32}
                className={"flex mx-auto my-auto"}
                color={"#6366f1"}
            />
        </div>
    )
}