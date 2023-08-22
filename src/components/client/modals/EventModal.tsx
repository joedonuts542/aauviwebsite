import useSWR from "swr";
import { useState, useEffect } from "react";

import { useAuth } from "@/app/client/auth";
import { useGroup } from "@/app/client/groups/group";

import { GroupEvent, User } from "@prisma/client";
import { DateTime } from "luxon";

import { Modal } from "@/components/form/Modal";

import { toast } from "react-hot-toast";
import { HiCheck, HiInformationCircle, HiX } from "react-icons/hi";
import Link from "next/link";

type eventDetails = GroupEvent & {
    users: User[],
    author: User
}

const updateEvent = async (
    id: string,
    groupId: string,
    join?: boolean,
    targetId?: string,
) => {
    try {
        const response = await fetch(
            `/api/groups/${groupId}/events/${id}`,
            {
                body: JSON.stringify({
                    join,
                    targetId
                }),
                method: "POST"
            }
        );

        const body = await response.json();
        if (body) {
            if (body.data) {
                toast.success(body.data)
            } else {
                throw Error(body.error);
            }
        } else {
            throw Error("Cannot modify this event")
        }
    } catch (error) {
        toast.error(`${error}`)
    }
}

export const EventModal = (props: {
    isOpen: boolean,
    onClose: () => void,
    refresh: () => void,
    eventId: string,
}) => {
    const auth = useAuth();
    const group = useGroup();

    const eventCache = useSWR(
        () => {
            return group && group.group ? `/api/groups/${group.group.id}/events/${props.eventId}` : null
        },
        fetch
    );

    const [event, setEvent] = useState<eventDetails>();
    useEffect(() => {
        if (!eventCache.isLoading
            && eventCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await eventCache.data?.json();
                    if (body.event) {
                        setEvent(body.event);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [props, eventCache]);

    return event ? (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={event.title}
            body={
                <div
                    className="grid grid-cols-2 gap-4 w-full"
                >
                    <span
                        className="text-indigo-950 text-sm w-full col-span-2"
                    >{event.description}</span>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >Start Time</span>
                        <span
                            className="text-indigo-950 text-sm"
                        >{DateTime.fromJSDate(new Date(event.start)).toFormat("ffff")}</span>
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >End Time</span>
                        <span
                            className="text-indigo-950 text-sm"
                        >{DateTime.fromJSDate(new Date(event.end)).toFormat("ffff")}</span>
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >Type</span>
                        <span
                            className="text-indigo-950 text-sm"
                        >{event.type[0]}{event.type.substring(1).toLowerCase()}</span>
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >Location</span>
                        <span
                            className="text-indigo-950 text-sm"
                        >
                            {
                                event.location
                                    ? <Link
                                        className="text-indigo-500"
                                        href={event.location}
                                    >Click Me</Link>
                                    : "No Location"
                            }
                        </span>
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold"
                        >Host</span>
                        <span
                            className="text-indigo-950 text-sm"
                        >{event.author.name}</span>
                    </div>
                    {
                        (
                            event.author.id === auth.user?.id
                        ) && (
                            <div
                                className="flex flex-col col-span-2"
                            >
                                <span
                                    className="text-indigo-950 text-sm font-semibold"
                                >Users</span>
                                {
                                    event.users.length > 0
                                        ? <div
                                            className="flex flex-wrap gap-4"
                                        >
                                            {
                                                event.users.map(u => (
                                                    <div
                                                        key={u.id}
                                                        className="flex flex-row gap-2 px-2 py-1 rounded-full w-fit bg-indigo-500"
                                                    >
                                                        <span
                                                            className="text-indigo-50 text-xs font-semibold my-auto"
                                                        >{u.name}</span>
                                                        <HiX
                                                            className="text-indigo-50 my-auto cursor-pointer"
                                                            onClick={() => {
                                                                updateEvent(
                                                                    event.id,
                                                                    group.group!.id,
                                                                    false,
                                                                    u.id
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        : <span
                                            className="text-indigo-950 text-sm"
                                        >No users signed up</span>
                                }
                            </div>
                        )
                    }
                    {
                        (
                            event.author.id === auth.user?.id
                            || event.users.findIndex(u => u.id === auth.user?.id) >= 0
                        ) ? (
                            <div
                                className="flex flex-row gap-4 px-4 py-2 rounded-full bg-green-500 col-span-2 mt-4"
                            >
                                <HiCheck
                                    className="text-indigo-50 my-auto"
                                />
                                <span
                                    className="text-indigo-50 text-sm my-auto"
                                >You are signed up for this event.</span>
                            </div>
                        ) : event.users.length >= (group.group?.maxHelpers || 0)
                            ? <div
                                className="flex flex-row gap-4 px-4 py-2 rounded-full bg-red-500 col-span-2 mt-4"
                            >
                                <HiX
                                    className="text-indigo-50 my-auto"
                                />
                                <span
                                    className="text-indigo-50 text-sm my-auto"
                                >This even is no longer accepting helpers.</span>
                            </div>
                            : <div
                                className="flex flex-row gap-4 px-4 py-2 rounded-full bg-purple-500 col-span-2 mt-4"
                            >
                                <HiInformationCircle
                                    className="text-indigo-50 my-auto"
                                />
                                <span
                                    className="text-indigo-50 text-sm my-auto"
                                >You are not signed up for this event.</span>
                            </div>
                    }
                </div>
            }
            footer={
                <>
                    {
                        (
                            event.author.id !== auth.user?.id
                            && event.users.findIndex(u => u.id === auth.user?.id) < 0
                            && event.users.length < (group.group?.maxHelpers || 0)
                        ) && (
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-green-500 text-indigo-50 hover:bg-green-600 disabled:bg-green-800 disabled:cursor-default transition duration-200"
                                onClick={() => {
                                    updateEvent(
                                        event.id,
                                        group.group!.id,
                                        true
                                    )
                                }}
                            >Sign Up</button>
                        )
                    }
                    {
                        (
                            event.author.id !== auth.user?.id
                            && event.users.findIndex(u => u.id === auth.user?.id) >= 0
                        ) && (
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-red-500 text-indigo-50 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-default transition duration-200"
                                onClick={() => {
                                    updateEvent(
                                        event.id,
                                        group.group!.id,
                                        false
                                    )
                                }}
                            >Leave</button>
                        )
                    }
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                        onClick={() => {
                            props.onClose();
                        }}
                    >Cancel</button>
                </>
            }
        />
    ) : undefined
}