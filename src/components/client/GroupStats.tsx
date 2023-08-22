import { HiBadgeCheck, HiBriefcase, HiCheck, HiClipboard, HiClipboardList, HiUser, HiUsers, HiXCircle } from "react-icons/hi";

import useSWR from "swr";
import { useState, useEffect } from "react";

import { Avatar } from "../content/Avatar";

import Image from "next/image";

import { GroupDetails } from "@/util/db/group"
import { GroupEvent, GroupVacation } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Duration } from "luxon";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const GroupStats = (props: {
    group: GroupDetails
}) => {
    const router = useRouter();

    const response = useSWR(`/api/groups/${props.group.id}/stats`, fetch);

    const [isActive, setIsActive] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);
    const [topDay, setTopDay] = useState<{ date: string, length: number }>();
    const [vacations, setVacations] = useState<GroupVacation[]>([]);
    const [events, setEvents] = useState<GroupEvent[]>([]);
    const [users, setUsers] = useState<number[]>([]);

    useEffect(() => {
        if (!response.isLoading
            && response.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await response.data?.json();
                    setTotal(body.total);
                    setTopDay(body.topDay);
                    setVacations(body.vacations);
                    setEvents(body.events);
                    setUsers(body.users);
                    setIsActive(body.isActive)
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [response]);

    return (
        <div
            className="flex flex-col gap-4"
        >
            <span
                className="text-indigo-950 text-lg font-semibold"
            >Group Overview</span>
            <div
                className="flex flex-row gap-4 w-full"
            >
                <div
                    className="flex flex-col p-8 w-full bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200"
                >
                    <div
                        className="flex flex-row gap-4"
                    >
                        <span
                            className="text-indigo-950 text-lg font-semibold my-auto"
                        >Current Activity</span>
                        {
                            isActive
                            && <span
                                className="px-2 py-1 bg-indigo-500 rounded-full text-indigo-50 font-semibold text-xs my-auto"
                            >ACTIVE</span>
                        }
                    </div>
                    <span
                        className="text-indigo-950 text-sm"
                    >{Duration.fromMillis(total).toFormat("h'hr' mm'min'")}</span>
                </div>
                <div
                    className="flex flex-col p-8 w-full bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Most Active Day: {topDay ? topDay.date : "None"}</span>
                    <span
                        className="text-indigo-950 text-sm"
                    >{topDay ? Duration.fromMillis(topDay.length).toFormat("h'hr' mm'min'") : "00min"}</span>
                </div>
            </div>
            <div
                className="flex flex-col gap-2 p-8 bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold"
                >In-game Employees</span>
                <div
                    className="flex flex-wrap gap-2 w-full"
                >
                    {
                        users.length > 0
                            ? users.map(u => (
                                <Link
                                    key={u}
                                    href={`/client/groups/${props.group.id}/roblox/${u}`}
                                    className="cursor-pointer"
                                >
                                    <Avatar
                                        userId={u.toString()}
                                        onError={() => (
                                            <div
                                                className="w-12 h-12 p-2 rounded-full bg-indigo-100"
                                            >
                                                <HiUser
                                                    className="my-auto mx-auto flex"
                                                />
                                            </div>
                                        )}
                                        className="w-12 h-12 p-2 rounded-full bg-indigo-100"
                                    />
                                </Link>
                            ))
                            : <span
                                className="text-indigo-950 text-sm"
                            >No active users</span>
                    }
                </div>
            </div>
            <div
                className="flex flex-row gap-4 w-full"
            >
                <div
                    className="flex flex-col p-8 gap-2 w-full h-full bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Upcoming Vacations</span>
                    {
                        vacations.length > 0
                            ? vacations.map((v) => (
                                <div
                                    key={v.id}
                                    className="flex flex-row px-6 py-4 justify-between bg-indigo-500 rounded-md shadow-md cursor-pointer"
                                >
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        {
                                            v.status === "APPROVED"
                                                ? <HiCheck
                                                    className="my-auto text-indigo-50"
                                                    size={32}
                                                />
                                                : v.status === "DENIED"
                                                    ? <HiXCircle
                                                        className="my-auto text-indigo-50"
                                                        size={32}
                                                    />
                                                    : <HiClipboard
                                                        className="my-auto text-indigo-50"
                                                        size={32}
                                                    />
                                        }
                                        <div
                                            className="flex flex-col my-auto max-w-[100%]"
                                        >
                                            <span
                                                className="text-indigo-50 font-semibold text-sm"
                                            >{new Date(v.start).toDateString()} - {new Date(v.end).toDateString()}</span>
                                            <span
                                                className="text-indigo-50 text-xs"
                                            >{v.description}</span>
                                        </div>
                                    </div>
                                    <span
                                        className="text-indigo-50 text-xs font-semibold my-auto"
                                    >{v.status}</span>
                                </div>
                            ))
                            : <div
                                className="flex flex-col gap-2 mx-auto my-auto text-center"
                            >
                                <Image
                                    width={156}
                                    height={156}
                                    src={"/static/NoVacations.svg"}
                                    alt={"no vacations"}
                                />
                                <span
                                    className="text-indigo-950 text-sm"
                                >No Vacations</span>
                            </div>
                    }
                </div>
                <div
                    className="flex flex-col p-8 gap-2 w-full h-full bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold"
                    >Upcoming Events</span>
                    {
                        events.length > 0
                            ? events.map((e) => (
                                <div
                                    key={e.id}
                                    className="flex flex-row px-6 py-4 justify-between bg-indigo-500 rounded-md shadow-md cursor-pointer"
                                >
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        {
                                            e.type === "SESSION"
                                                ? <HiUsers
                                                    className="my-auto text-indigo-50"
                                                    size={32}
                                                />
                                                : e.type === "INTERVIEW"
                                                    ? <HiClipboardList
                                                        className="my-auto text-indigo-50"
                                                        size={32}
                                                    />
                                                    : e.type === "MEETING"
                                                        ? <HiBriefcase
                                                            className="my-auto text-indigo-50"
                                                            size={32}
                                                        />
                                                        : <HiBadgeCheck
                                                            className="my-auto text-indigo-50"
                                                            size={32}
                                                        />
                                        }
                                        <div
                                            className="flex flex-col my-auto max-w-[100%]"
                                        >
                                            <span
                                                className="text-indigo-50 font-semibold text-sm"
                                            >{e.title}</span>
                                            <span
                                                className="text-indigo-50 text-xs"
                                            >{e.start.toString()} - {e.end.toString()}</span>
                                        </div>
                                    </div>
                                    <span
                                        className="text-indigo-50 text-xs font-semibold my-auto"
                                    >{e.type}</span>
                                </div>
                            ))
                            : <div
                                className="flex flex-col gap-2 mx-auto my-auto text-center"
                            >
                                <Image
                                    width={156}
                                    height={156}
                                    src={"/static/NoEvents.svg"}
                                    alt={"no events"}
                                />
                                <span
                                    className="text-indigo-950 text-sm"
                                >No Events</span>
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}