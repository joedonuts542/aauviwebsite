import useSWR from "swr";
import { useState, useEffect } from "react";

import { useAuth } from "@/app/client/auth";
import { useGroup } from "@/app/client/groups/group";

import { TicketOverview } from "@/app/api/groups/[id]/tickets/route";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { Avatar } from "@/components/content/Avatar";

export const Archive = () => {
    const group = useGroup();
    const auth = useAuth();

    const [skip, setSkip] = useState<number>(0);
    const [tickets, setTickets] = useState<TicketOverview[]>([]);
    const ticketsCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/tickets/archive?skip=${skip}` : null
        },
        fetch
    );

    useEffect(() => {
        if (!ticketsCache.isLoading
            && ticketsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await ticketsCache.data?.json();
                    if (body.tickets) {
                        setTickets(body.tickets);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [ticketsCache]);

    useEffect(() => {
        ticketsCache.mutate()
    }, [skip]);

    return (ticketsCache.isLoading) ? (
        <div
            className="w-full flex flex-row"
        >
            <MoonLoader
                size={32}
                className={"flex mx-auto my-auto"}
                color={"#6366f1"}
            />
        </div>
    ) : (
        <div
            className="flex flex-col w-full gap-4"
        >
            <div
                className="flex flex-row justify-between w-full bg-indigo-50 rounded-md shadow-md p-8"
            >
                <span
                    className="text-indigo-950 text-xs my-auto"
                >{`Showing ${tickets.length} out of 15`}</span>
                <div
                    className="flex flex-row gap-4 my-auto"
                >
                    <span
                        className={`text-indigo-50 ${skip > 0 ? "bg-indigo-500 cursor-pointer" : "bg-indigo-600"} text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-indigo-600 transition duration-200`}
                        onClick={() => {
                            if (skip > 0) {
                                setSkip(skip - 15)
                            }
                        }}
                    >BACK</span>
                    <span
                        className={`text-indigo-50 ${tickets.length === 15 ? "bg-indigo-500 cursor-pointer" : "bg-indigo-600"} text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-indigo-600 transition duration-200`}
                        onClick={() => {
                            if (tickets.length === 15) {
                                setSkip(skip + 15)
                            }
                        }}
                    >NEXT</span>
                </div>
            </div>
            {
                tickets.map(t => (
                    <Link
                        key={t.id}
                        className="flex flex-col w-full p-8 rounded-md shadow-md bg-indigo-50 hover:shadow-lg cursor-pointer transition duration-200"
                        href={`/client/tickets/${t.id}`}
                    >
                        <div
                            className="flex flex-row w-full justify-between"
                        >
                            <div
                                className="flex flex-row gap-4 my-auto"
                            >
                                <Avatar
                                    userId={t.user.robloxId}
                                    onError={() => (
                                        <div
                                            className="w-12 h-12 rounded-md bg-indigo-100 my-auto"
                                        />
                                    )}
                                    className="w-12 h-12 rounded-md my-auto"
                                />
                                <div
                                    className="flex flex-col my-auto"
                                >
                                    <span
                                        className="text-indigo-950 text-md font-semibold"
                                    >{t.title}</span>
                                    <span
                                        className="text-indigo-950 text-xs"
                                    >by{" "}
                                        {
                                            t.user.name
                                        }
                                    </span>
                                </div>
                            </div>
                            <span
                                className="my-auto text-indigo-950 text-sm font-semibold"
                            >{t.type.name}</span>
                        </div>
                        <div
                            className="flex flex-col mt-4"
                        >
                            <span
                                className="text-indigo-950 text-sm"
                            >{t.description}</span>
                            <span
                                className="text-indigo-900 text-xs mt-2"
                            >{new Date(t.createdAt).toDateString()}</span>
                        </div>
                    </Link>
                ))
            }
        </div>
    )
}