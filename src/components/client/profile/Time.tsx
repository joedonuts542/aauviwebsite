import useSWR from "swr";
import { useState, useEffect } from "react";

import { userContext } from "@/app/client/auth";
import { groupContext } from "@/app/client/groups/group";
import { GroupActivity } from "@prisma/client";

import toast from "react-hot-toast";
import Image from "next/image";
import { MoonLoader } from "react-spinners";
import { DateTime, Duration } from "luxon";
import { HiPause, HiTrash } from "react-icons/hi";

import { Modal } from "@/components/form/Modal";
import { Input } from "@/components/form/TextInput";

export const Time = (props: {
    group: groupContext,
    auth: userContext,
    version: number,
    id: string,
    refresh: () => void,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [timeModal, setTimeModal] = useState<boolean>(false);

    const [topPlaceId, setTopPlaceId] = useState<number>();
    const [totalHours, setTotalHours] = useState<number>(0);
    const [timeEntries, setTimeEntries] = useState<GroupActivity[]>([]);

    const [newTimeEntry, setNewTimeEntry] = useState<{
        day?: string,
        start?: string,
        end?: string
    }>({});

    const [topPlace, setTopPlace] = useState<{
        imageUrl?: string,
        name: string
    }>();

    const timerCache = useSWR(
        () => {
            return (props.group.group) ? `/api/groups/${props.group.group.id}/profile/${props.id}/time` : null
        }, fetch
    );

    useEffect(() => {
        if (
            !timerCache.isLoading
            && timerCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await timerCache.data?.json();
                    if (body && body.entries) {
                        setTimeEntries(body.entries as GroupActivity[]);
                        setLoading(false);
                    }

                    if (body && body.total) {
                        setTotalHours(body.total as number);
                    }
                } catch (error) {

                }
            }

            tryJson();
        } else if (timerCache.error) {
            toast.error("Error loading group data");
        }
    }, [props.version, timerCache]);

    useEffect(() => {
        if (timeEntries.length > 0) {
            let places: {
                id: string,
                length: number
            }[] = [];

            timeEntries.forEach(t => {
                if (t.placeId && t.length) {
                    let index = places.findIndex(p => p.id === t.placeId);
                    if (index >= 0) {
                        places[index].length += t.length;
                    } else {
                        places.push({
                            id: t.placeId,
                            length: t.length
                        })
                    }
                }
            });

            if (places.length > 0) {
                let top = places.sort((a, b) => a.length - b.length)[0].id
                if (top) { setTopPlaceId(Number(top)) }
            }
        }
    }, [timeEntries]);

    useEffect(() => {
        if (Number(topPlaceId) > 0) {
            fetch(`/api/proxy/place/${topPlaceId}`).then(async (response) => {
                try {
                    const body = await response.json();
                    if (body && body.name) {
                        setTopPlace({
                            name: body.name,
                            imageUrl: body.imageUrl
                        });
                    }
                } catch (error) {

                }
            })
        }
    }, [topPlaceId])

    const [creating, setCreating] = useState<boolean>(false);
    const createTimer = async () => {
        if (!creating) {
            if (newTimeEntry.start && newTimeEntry.end && newTimeEntry.day && props.group.group) {
                setCreating(true);
                const data = {
                    start: new Date(`${newTimeEntry.day} ${newTimeEntry.start}`),
                    end: new Date(`${newTimeEntry.day} ${newTimeEntry.end}`)
                }

                const response = await fetch(
                    `/api/groups/${props.group.group.id}/profile/${props.id}/time`,
                    {
                        method: "POST",
                        body: JSON.stringify(data),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                try {
                    const body = await response.json();
                    if (body.data) {
                        toast.success(body.data);
                        setNewTimeEntry({});
                        setTimeModal(false);
                        props.refresh();
                    } else if (body.error) {
                        toast.error(body.error);
                    }
                } catch (error) {
                    toast.error("Failed to post new time entry");
                }

                setCreating(false);
            } else {
                toast.error("Please enter all modal fields");
            }
        }
    }

    const [deleting, setDeleting] = useState<boolean>(false);
    const deleteTimer = async (id: string, pause?: true) => {
        if (!deleting) {
            if (props.group.group) {
                setDeleting(true);
                const response = await fetch(
                    `/api/groups/${props.group.group.id}/profile/${props.id}/time?activityId=${id}&pause=${pause}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                try {
                    const body = await response.json();
                    if (body.data) {
                        toast.success(body.data);
                        setNewTimeEntry({});
                        setTimeModal(false);
                        props.refresh();
                    } else if (body.error) {
                        toast.error(body.error);
                    }
                } catch (error) {
                    toast.error("Failed to remove time entry");
                }

                setCreating(false);
            } else {
                toast.error("Unable to load group data");
            }
        }
    }

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
            className="flex flex-row gap-4 w-full"
        >
            <div
                className="flex flex-col gap-4 w-full h-full"
            >
                <div
                    className="flex flex-col p-8 w-full bg-indigo-50 rounded-md shadow-md gap-4 h-[-webkit-fill-available]"
                >
                    <div
                        className="flex flex-row justify-between"
                    >
                        <div
                            className="flex flex-col my-auto"
                        >
                            <span
                                className="text-indigo-950 text-lg font-semibold"
                            >This Period</span >
                            <span
                                className="text-indigo-950 text-sm"
                            >Total: {Duration.fromMillis(totalHours).toFormat("hh'hr' mm'min'")}</span>
                        </div >
                        {
                            (props.group.user?.role?.admin
                                || props.group.user?.role?.humanResources)
                            && <span
                                className="text-indigo-50 bg-indigo-500 rounded-full shadow-sm px-4 py-2 text-sm font-semibold cursor-pointer hover:shadow-md hover:bg-indigo-600 transition duration-200 my-auto"
                                onClick={() => {
                                    setTimeModal(true);
                                }}
                            > + Add Time </span>
                        }
                    </div >
                    {
                        timeEntries.length > 0
                            ? <div
                                className="flex flex-col gap-4"
                            >
                                {
                                    timeEntries.map(t => (
                                        <div
                                            key={t.id}
                                            className={`flex flex-row justify-between w-full p-4 rounded-md border-[1px] ${t.isActive ? "border-indigo-200" : "border-red-300"}`}
                                        >
                                            <div
                                                className="flex flex-col my-auto"
                                            >
                                                <div
                                                    className="flex flex-row gap-2"
                                                >
                                                    <span
                                                        className="text-indigo-950 text-md font-semibold my-auto"
                                                    >
                                                        {DateTime.fromJSDate(new Date(t.start)).toFormat("DDDD")}
                                                    </span>
                                                    {
                                                        (!t.end && !t.length)
                                                        && <span
                                                            className="text-indigo-50 text-xs font-semibold bg-indigo-500 rounded-full px-4 py-2 my-auto"
                                                        >LIVE</span>
                                                    }
                                                </div>
                                                <span
                                                    className="text-indigo-950 text-sm"
                                                >
                                                    {
                                                        (!t.end)
                                                            ? `Started at ${DateTime.fromJSDate(new Date(t.start)).toFormat("ttt")}`
                                                            : `${DateTime.fromJSDate(new Date(t.start)).toFormat("ttt")} - ${DateTime.fromJSDate(new Date(t.end)).toFormat("ttt")}`
                                                    }
                                                </span>
                                                <span
                                                    className="text-indigo-950 text-xs"
                                                >
                                                    {
                                                        (!t.length)
                                                            ? `In-game`
                                                            : `${Duration.fromMillis(t.length).toFormat("hh'hr' mm'min'")}`
                                                    }
                                                </span>
                                            </div>
                                            <div
                                                className="flex flex-col my-auto"
                                            >
                                                {
                                                    (t.isActive)
                                                        ? (!t.length && !t.end)
                                                            ? props.auth.user?.id === props.id
                                                                ? <HiPause
                                                                    className="text-indigo-950 hover:text-red-500 transition duration-200"
                                                                    onClick={() => {
                                                                        deleteTimer(t.id, true);
                                                                    }}
                                                                />
                                                                : (props.group.user?.role.admin
                                                                    || props.group.user?.role.humanResources)
                                                                    ? <HiPause
                                                                        className="text-indigo-950 hover:text-red-500 transition duration-200"
                                                                        onClick={() => {
                                                                            deleteTimer(t.id, true);
                                                                        }}
                                                                    />
                                                                    : undefined
                                                            : (props.group.user?.role.admin
                                                                || props.group.user?.role.humanResources)
                                                                ? <HiTrash
                                                                    className="text-indigo-950 hover:text-red-500 transition duration-200"
                                                                    onClick={() => {
                                                                        deleteTimer(t.id);
                                                                    }}
                                                                />
                                                                : undefined
                                                        : undefined
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            : <div
                                className="flex flex-col text-center mx-auto my-auto"
                            >
                                <Image
                                    width={180}
                                    height={180}
                                    src={"/static/NoTime.svg"}
                                    alt={"NoTime"}
                                    className={"mx-auto mb-6"}
                                />
                                <span
                                    className="text-indigo-950 text-xs mx-auto"
                                >No Time Entries</span>
                            </div>
                    }
                </div >
            </div >
            <div
                className="flex flex-col gap-4 w-full h-full"
            >
                <div
                    className="flex flex-col w-full bg-indigo-50 rounded-md shadow-md p-8 gap-2"
                >
                    {
                        totalHours >= Number(props.group.group?.activityRequirement) * 1000 * 60 * 60
                            ? <>
                                <span
                                    className="text-indigo-50 text-sm font-bold px-4 py-2 rounded-full bg-green-500 w-fit"
                                >IN-GOOD STANDING</span>
                                <span
                                    className="text-indigo-950 text-sm"
                                >This user has met all of the activity requirements for this period.</span>
                            </>
                            : <>
                                <span
                                    className="text-indigo-50 text-sm font-bold px-4 py-2 rounded-full bg-red-500 w-fit"
                                >NOT COMPLETED</span>
                                <span
                                    className="text-indigo-950 text-sm"
                                >This user has not met all of the activity requirements for this period.</span>
                            </>
                    }
                </div>
                <div
                    className="flex flex-col w-full bg-indigo-50 rounded-md shadow-md p-8 gap-2"
                >
                    <div
                        className="flex flex-row gap-2"
                    >
                        <span
                            className="text-indigo-950 text-6xl font-semibold"
                        >{Duration.fromMillis(totalHours).toFormat("hh")}</span>
                        <span
                            className="text-indigo-950 text-md font-semibold mt-auto"
                        >hours</span>
                    </div>
                    <span
                        className="text-indigo-950 text-sm"
                    >spent in enrolled games since the creation of this group.</span>
                </div>
                <div
                    className="flex flex-col w-full bg-indigo-50 rounded-md shadow-md p-8 gap-2"
                >
                    {
                        (topPlaceId
                            && !topPlace)
                            ? <div
                                className="flex flex-col w-full min-h-[100px]"
                            >
                                <MoonLoader
                                    size={32}
                                    className={"flex mx-auto my-auto"}
                                    color={"#6366f1"}
                                />
                            </div>
                            : topPlace
                                ? <>
                                    {
                                        topPlace.imageUrl
                                            ? <img
                                                src={topPlace.imageUrl}
                                                alt={"Game Icon"}
                                                className={"w-full object-contain rounded-md shadow-md"}
                                            />
                                            : <Image
                                                width={256}
                                                height={256}
                                                alt={"Game Icon"}
                                                className={"w-full object-contain rounded-md"}
                                                src={"/static/NoTopPlace.svg"}
                                            />
                                    }
                                    <div
                                        className="flex flex-col"
                                    >
                                        <span
                                            className="text-indigo-950 text-lg font-semibold mt-4"
                                        >{topPlace.name}</span>
                                        <span
                                            className="text-indigo-950 text-sm"
                                        >Most Played Game</span>
                                    </div>
                                </>
                                : <>
                                    <Image
                                        width={256}
                                        height={256}
                                        alt={"Game Icon"}
                                        className={"w-full object-contain rounded-md"}
                                        src={"/static/NoTopPlace.svg"}
                                    />
                                    <div
                                        className="flex flex-col"
                                    >
                                        <span
                                            className="text-indigo-950 text-lg font-semibold mt-4"
                                        >No Place Available</span>
                                        <span
                                            className="text-indigo-950 text-sm"
                                        >Most Played Game</span>
                                    </div>
                                </>
                    }
                </div>
            </div>
            <Modal
                isOpen={timeModal}
                onClose={() => {
                    setTimeModal(false)
                }}
                title={"Add Time Entry"}
                body={
                    <div
                        className="grid grid-cols-2 w-full gap-4"
                    >
                        <Input
                            className="col-span-2"
                            label="Date"
                            type="date"
                            value={newTimeEntry.day}
                            onChange={(event) => {
                                setNewTimeEntry({
                                    ...newTimeEntry,
                                    day: event.target.value
                                })
                            }}
                        />
                        <Input
                            label="Start Time"
                            type="time"
                            value={newTimeEntry.start}
                            onChange={(event) => {
                                setNewTimeEntry({
                                    ...newTimeEntry,
                                    start: event.target.value
                                })
                            }}
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={newTimeEntry.end}
                            onChange={(event) => {
                                setNewTimeEntry({
                                    ...newTimeEntry,
                                    end: event.target.value
                                })
                            }}
                        />
                        {
                            (newTimeEntry.day
                                && newTimeEntry.start
                                && newTimeEntry.end)
                                ? <span
                                    className="text-indigo-950 text-sm col-span-2"
                                >
                                    Duration: {
                                        Duration.fromMillis(
                                            new Date(`${newTimeEntry.day} ${newTimeEntry.end}`).getTime() - new Date(`${newTimeEntry.day} ${newTimeEntry.start}`).getTime()
                                        ).toFormat("hh'hr' mm'min'")
                                    }
                                </span>
                                : undefined
                        }
                    </div>
                }
                footer={
                    <>
                        <button
                            type="button"
                            className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                            onClick={createTimer}
                            disabled={creating}
                        >Post</button>
                        <button
                            type="button"
                            className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                            onClick={() => {
                                setTimeModal(false);
                                setNewTimeEntry({});
                            }}
                        >Cancel</button>
                    </>
                }
            />
        </div >
    )
}