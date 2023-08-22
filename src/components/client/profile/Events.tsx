import useSWR from "swr";
import { useState, useEffect } from "react";

import { userContext } from "@/app/client/auth";
import { groupContext } from "@/app/client/groups/group";
import { GroupEvent } from "@prisma/client";

import toast from "react-hot-toast";
import { MoonLoader } from "react-spinners";
import { DateTime } from "luxon";
import { HiChat, HiClipboard, HiTrash, HiUserAdd, HiUserRemove, HiUsers } from "react-icons/hi";
import { Table } from "@/components/form/Table";
import Link from "next/link";

export const Events = (props: {
    group: groupContext,
    auth: userContext,
    version: number,
    id: string,
    refresh: () => void,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [eventModal, setEventModal] = useState<boolean>(false);
    const [deleteEventModal, setDeleteEventModal] = useState<boolean>(false);

    const [nextSession, setNextSession] = useState<GroupEvent>();
    const [nextMeeting, setNextMeeting] = useState<GroupEvent>();
    const [nextTraining, setNextTraining] = useState<GroupEvent>();
    const [groupEvents, setGroupEvents] = useState<GroupEvent[]>([]);

    const eventsCache = useSWR(
        () => {
            return (props.group.group) ? `/api/groups/${props.group.group.id}/profile/${props.id}/events` : null
        }, fetch
    );

    useEffect(() => {
        if (
            !eventsCache.isLoading
            && eventsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await eventsCache.data?.json();
                    if (body && body.events) {
                        setGroupEvents(body.events as GroupEvent[]);
                        setLoading(false)
                    }

                    if (body && body.nextSession) {
                        setNextSession(body.nextSession as GroupEvent);
                    }

                    if (body && body.nextTraining) {
                        setNextTraining(body.nextTraining as GroupEvent);
                    }

                    if (body && body.nextMeeting) {
                        setNextMeeting(body.nextMeeting as GroupEvent);
                    }
                } catch (error) {

                }
            }

            tryJson();
        } else if (eventsCache.error) {
            toast.error("Error loading group data");
        }
    }, [props.version, eventsCache]);

    return loading ? (
        <div
            className="flex flex-col gap-4 w-full h-full"
        >
            <MoonLoader
                size={32}
                className={"flex mx-auto my-auto"}
                color={"#6366f1"}
            />
        </div>
    ) : (
        <div
            className="flex flex-col gap-4 w-full"
        >
            <div
                className="flex flex-row gap-4"
            >
                <div
                    className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 gap-4 w-full cursor-pointer hover:shadow-lg transition duration-200"
                >
                    <div
                        className="flex flex-col p-4 rounded-full bg-green-200 w-fit"
                    >
                        <HiUsers
                            className="text-green-700 my-auto mx-auto"
                        />
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold"
                        >Next Session</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >
                            {
                                nextSession ? nextSession.title : "None Scheduled"
                            }
                        </span>
                    </div>
                    <div
                        className="flex flex-col mt-2"
                    >
                        <span
                            className="text-indigo-950 text-sm"
                        >{nextSession ? DateTime.fromJSDate(new Date(nextSession.start)).toFormat("fff") : "Not available"}</span>
                    </div>
                </div>
                <div
                    className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 gap-4 w-full cursor-pointer hover:shadow-lg transition duration-200"
                >
                    <div
                        className="flex flex-col p-4 rounded-full bg-pink-200 w-fit"
                    >
                        <HiClipboard
                            className="text-pink-700 my-auto mx-auto"
                        />
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold"
                        >Next Training</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >
                            {
                                nextTraining ? nextTraining.title : "None Scheduled"
                            }
                        </span>
                    </div>
                    <div
                        className="flex flex-col mt-2"
                    >
                        <span
                            className="text-indigo-950 text-sm"
                        >{nextTraining ? DateTime.fromJSDate(new Date(nextTraining.start)).toFormat("fff") : "Not available"}</span>
                    </div>
                </div>
                <div
                    className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 gap-4 w-full cursor-pointer hover:shadow-lg transition duration-200"
                >
                    <div
                        className="flex flex-col p-4 rounded-full bg-blue-200 w-fit"
                    >
                        <HiChat
                            className="text-blue-700 my-auto mx-auto"
                        />
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold"
                        >Next Meeting</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >
                            {
                                nextMeeting ? nextMeeting.title : "None Scheduled"
                            }
                        </span>
                    </div>
                    <div
                        className="flex flex-col mt-2"
                    >
                        <span
                            className="text-indigo-950 text-sm"
                        >{nextMeeting ? DateTime.fromJSDate(new Date(nextMeeting.start)).toFormat("fff") : "Not available"}</span>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col gap-4 p-8 bg-indigo-50 rounded-md shadow-md"
            >
                <Table
                    columns={[
                        {
                            display: "Title",
                            key: "title"
                        },
                        {
                            display: "Location",
                            formatter: (row) => row.location ? (
                                <Link
                                    className="text-indigo-500 text-sm cursor-pointer"
                                    href={row.location}
                                >Link</Link>
                            ) : (
                                "No Location"
                            )
                        },
                        {
                            display: "Type",
                            formatter: (row) => `${row.type[0]}${row.type.substring(1).toLowerCase()}`
                        },
                        {
                            display: "Start",
                            formatter: (row) => DateTime.fromJSDate(new Date(row.start)).toFormat("fff")
                        },
                        {
                            display: "End",
                            formatter: (row) => DateTime.fromJSDate(new Date(row.end)).toFormat("fff")
                        },
                        {
                            display: "Host",
                            formatter: (row) => row.author.name
                        }
                    ]}
                    data={groupEvents}
                />
            </div>
        </div>
    )
}