"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";

import { useAuth } from "../auth";
import { Group, GroupTicket, TicketType } from "@prisma/client";
import Link from "next/link";
import { Logo } from "@/components/content/Logo";

export type TicketDetails = GroupTicket & {
    group: {
        id: string,
        groupId: string,
        name: string
    },
    _count: {
        responses: number
    },
    type: TicketType
}

export default function Page() {
    const auth = useAuth();

    const [tickets, setTickets] = useState<TicketDetails[]>([]);
    const ticketsCache = useSWR(
        `/api/tickets`,
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

    return (
        <div
            className="flex flex-col gap-4"
        >
            {
                tickets.length > 0
                    ? tickets.map(t => (
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
                                    <Logo
                                        groupId={t.group.groupId}
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
                                                (!t.isActive)
                                                && <span
                                                    className="px-2 py-1 text-indigo-50 text-xs bg-red-500 rounded-full font-semibold my-auto"
                                                >CLOSED</span>
                                            }
                                        </div>
                                        <span
                                            className="text-indigo-950 text-xs"
                                        >for {t.group.name}</span>
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
                                    className="text-indigo-900 text-xs"
                                >{new Date(t.createdAt).toDateString()}</span>
                            </div>
                        </Link>
                    ))
                    : <div
                        className=""
                    >

                    </div>
            }
        </div>
    )
}