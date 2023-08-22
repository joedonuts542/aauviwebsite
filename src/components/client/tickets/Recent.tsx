import useSWR from "swr";
import { useState, useEffect } from "react";

import { useAuth } from "@/app/client/auth";
import { useGroup } from "@/app/client/groups/group";

import { TicketOverview } from "@/app/api/groups/[id]/tickets/route";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { Avatar } from "@/components/content/Avatar";

export const Recent = () => {
    const group = useGroup();
    const auth = useAuth();

    const [tickets, setTickets] = useState<TicketOverview[]>([]);
    const ticketsCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/tickets` : null
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
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        <span
                                            className="text-indigo-950 text-md font-semibold my-auto"
                                        >{t.title}</span>
                                        {
                                            (t._count.responses === 0)
                                            && <span
                                                className="px-2 py-1 text-indigo-50 text-xs bg-indigo-500 rounded-full font-semibold my-auto"
                                            >NEW</span>
                                        }
                                    </div>
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