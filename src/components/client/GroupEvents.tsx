import useSWR from "swr";
import { useState, useEffect } from "react";

import { DateTime } from "luxon"
import { MoonLoader } from "react-spinners";

import { Group, GroupEvent, GroupTimes } from "@prisma/client";
import { CreateEvent } from "./modals/CreateEvent";
import { EventModal } from "./modals/EventModal";

export const GroupEvents = (props: {
    group: Group
}) => {
    const [thisWeek, setThisWeek] = useState<{
        date: DateTime,
        events: GroupEvent[]
    }[]>([]);
    const [nextWeek, setNextWeek] = useState<{
        date: DateTime,
        events: GroupEvent[]
    }[]>([]);

    const [eventModal, setEventModal] = useState<boolean>(false);
    const [addEventModal, setAddEventModal] = useState<boolean>(false);
    const [activeEventId, setActiveEventId] = useState<string>("");
    const [events, setEvents] = useState<GroupEvent[]>([]);
    const [times, setTimes] = useState<GroupTimes[]>([]);

    const eventCache = useSWR(
        `/api/groups/${props.group.id}/events`,
        fetch
    );

    useEffect(() => {
        if (!eventCache.isLoading
            && eventCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await eventCache.data?.json();
                    if (body.events) {
                        setEvents(body.events);
                    }

                    if (body.times) {
                        setTimes(body.times);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [props, eventCache])

    useEffect(() => {
        const startOfWeek = DateTime.now().setZone("Etc/UTC").startOf("week");
        const startOfNextWeek = startOfWeek.plus({ week: 1 });

        let weekDays: {
            date: DateTime,
            events: GroupEvent[]
        }[] = []
        for (let i = 0; i < 7; i++) {
            weekDays.push({
                date: startOfWeek.plus({ days: i }).startOf("day"),
                events: events.filter(e => (
                    new Date(e.start).getTime() >= startOfWeek.plus({ days: i }).startOf("day").toMillis()
                    && new Date(e.start).getTime() <= startOfWeek.plus({ day: i }).endOf("day").toMillis()
                )).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            })
        }

        let nextWeekDays: {
            date: DateTime,
            events: GroupEvent[]
        }[] = []
        for (let i = 0; i < 7; i++) {
            nextWeekDays.push({
                date: startOfNextWeek.plus({ days: i }).startOf("day"),
                events: events.filter(e => (
                    new Date(e.start).getTime() >= startOfNextWeek.plus({ days: i }).startOf("day").toMillis()
                    && new Date(e.start).getTime() <= startOfNextWeek.plus({ day: i }).endOf("day").toMillis()
                )).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            })
        }

        setThisWeek(weekDays);
        setNextWeek(nextWeekDays);
    }, [events])

    const refresh = async () => {
        eventCache.mutate();
    }

    return (
        <div
            className="flex flex-col gap-4 w-full mt-4"
        >
            <div
                className="flex flex-row w-full justify-end"
            >
                <button
                    className="text-indigo-50 text-sm font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                    onClick={() => {
                        setAddEventModal(true);
                    }}
                >New Event</button>
            </div>
            <div
                className="flex flex-col gap-2 w-full bg-indigo-50 rounded-md shadow-md p-8"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold"
                >This Week</span>
                <div
                    className="flex flex-row w-full gap-2"
                >
                    {
                        thisWeek.length > 0
                            ? thisWeek.map(w => (
                                <div
                                    key={w.toString()}
                                    className={`flex flex-col w-full h-full border-r-[1px] border-r-indigo-100 last-of-type:border-r-0 pr-2 last-of-type:p-0`}
                                >
                                    <span
                                        className="text-indigo-950 text-sm font-semibold"
                                    >{w.date.weekdayLong}</span>
                                    <span
                                        className="text-indigo-950 text-xs mb-2"
                                    >{w.date.toFormat("DDD")}</span>
                                    <div
                                        className="flex flex-col gap-2 max-h-[200px] overflow-y-auto"
                                    >
                                        {
                                            w.events.map(e => (
                                                <div
                                                    key={e.id}
                                                    className={
                                                        `flex flex-col w-full rounded-md p-2 cursor-pointer
                                                            ${
                                                                e.type === "SESSION"
                                                                    ? "bg-indigo-500"
                                                                    : e.type === "TRAINING"
                                                                        ? "bg-green-500"
                                                                        : "bg-teal-500"
                                                            }
                                                        `
                                                    }
                                                    onClick={() => {
                                                        setActiveEventId(e.id);
                                                        setEventModal(true);
                                                    }}
                                                >
                                                    <span
                                                        className="text-indigo-50 text-xs font-semibold"
                                                    >{DateTime.fromJSDate(new Date(e.start)).toFormat("t ZZZZ")}</span>
                                                </div>
                                            ))
                                        }
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
                </div>
                <div
                    className="flex flex-row gap-6 mt-4"
                >
                    <div
                        className="flex flex-row gap-2"
                    >
                        <div
                            className="flex flex-col px-4 py-2 bg-indigo-500 my-auto rounded-full"
                        />
                        <span
                            className="text-indigo-950 text-sm my-auto"
                        >Session</span>
                    </div>
                    <div
                        className="flex flex-row gap-2"
                    >
                        <div
                            className="flex flex-col px-4 py-2 bg-green-500 my-auto rounded-full"
                        />
                        <span
                            className="text-indigo-950 text-sm my-auto"
                        >Training</span>
                    </div>
                    <div
                        className="flex flex-row gap-2"
                    >
                        <div
                            className="flex flex-col px-4 py-2 bg-teal-500 my-auto rounded-full"
                        />
                        <span
                            className="text-indigo-950 text-sm my-auto"
                        >Meeting</span>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col gap-2 w-full bg-indigo-50 rounded-md shadow-md p-8"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold"
                >Next Week</span>
                <div
                    className="flex flex-row w-full gap-2"
                >
                    {
                        nextWeek.length > 0
                            ? nextWeek.map(w => (
                                <div
                                    key={w.toString()}
                                    className="flex flex-col w-full h-full border-r-[1px] border-r-indigo-100 last-of-type:border-r-0 pr-2 last-of-type:p-0"
                                >
                                    <span
                                        className="text-indigo-950 text-sm font-semibold"
                                    >{w.date.weekdayLong}</span>
                                    <span
                                        className="text-indigo-950 text-xs mb-2"
                                    >{w.date.toFormat("DDD")}</span>
                                    <div
                                        className="flex flex-col gap-2 max-h-[200px] overflow-y-auto"
                                    >
                                        {
                                            w.events.map(e => (
                                                <div
                                                    key={e.id}
                                                    className={
                                                        `flex flex-col w-full rounded-md p-2 cursor-pointer
                                                            ${
                                                                e.type === "SESSION"
                                                                    ? "bg-indigo-500"
                                                                    : e.type === "TRAINING"
                                                                        ? "bg-green-500"
                                                                        : "bg-teal-500"
                                                            }
                                                        `
                                                    }
                                                    onClick={() => {
                                                        setActiveEventId(e.id);
                                                        setEventModal(true);
                                                    }}
                                                >
                                                    <span
                                                        className="text-indigo-50 text-xs font-semibold"
                                                    >{DateTime.fromJSDate(new Date(e.start)).toFormat("t ZZZZ")}</span>
                                                </div>
                                            ))
                                        }
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
                </div>
            </div>
            <CreateEvent
                isOpen={addEventModal}
                onClose={() => {
                    setAddEventModal(false);
                }}
                refresh={refresh}
                group={props.group}
                times={times}
                events={events}
            />
            {
                activeEventId
                && <EventModal
                    isOpen={eventModal}
                    onClose={() => {
                        setEventModal(false);
                    }}
                    refresh={refresh}
                    eventId={activeEventId}
                />
            }
        </div>
    )
}