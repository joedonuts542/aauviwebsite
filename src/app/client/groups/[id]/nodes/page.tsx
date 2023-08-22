"use client";

import useSWR from "swr";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { MoonLoader } from "react-spinners";
import { GroupHeader } from "@/components/client/GroupHeader";
import { Group, GroupTimes, TicketType } from "@prisma/client";
import { HiChevronDown, HiLockClosed, HiX } from "react-icons/hi";
import { Toggle } from "@/components/form/Toggle";
import { Input, Select, TextArea } from "@/components/form/TextInput";
import toast from "react-hot-toast";

const Node = (props: {
    unlocked?: true,
    activated: boolean,
    setActivated: (active: boolean) => void,
    title: string,
    onExpand: React.ReactNode
}) => {
    const [opened, setOpened] = useState<boolean>(false);

    return (
        <div
            className="flex flex-col gap-4 rounded-md shadow-md p-8 bg-indigo-50 w-full"
        >
            <div
                className="flex flex-row justify-between w-full"
            >
                <div
                    className="flex flex-row gap-4 my-auto"
                >
                    <HiChevronDown
                        className={`text-indigo-950 my-auto transition duration-200 ${opened ? "rotate-180" : ""} cursor-pointer`}
                        onClick={() => {
                            setOpened(!opened);
                        }}
                    />
                    <span
                        className="text-indigo-950 text-md font-semibold my-auto"
                    >
                        {props.title}
                    </span>
                </div>
                <div
                    className="flex flex-row my-auto"
                >
                    {
                        props.unlocked
                            ? <Toggle
                                checked={props.activated}
                                onChange={(event) => {
                                    props.setActivated(event);
                                }}
                            />
                            : <>
                                <HiLockClosed
                                    size={12}
                                    className="text-indigo-500 my-auto mr-2"
                                />
                                <span
                                    className="text-indigo-500 text-xs my-auto"
                                >Upgrade to unlock</span>
                            </>
                    }
                </div>
            </div>
            {
                opened
                && props.onExpand
            }
        </div>
    )
}

export default function GroupPage() {
    const group = useGroup();
    const auth = useAuth();

    const [editableGroup, setEditableGroup] = useState<Group>();

    useEffect(() => {
        if (group.group) {
            setEditableGroup(group.group);
        }
    }, [group]);

    const [types, setTypes] = useState<TicketType[]>([]);
    const [times, setTimes] = useState<GroupTimes[]>([]);
    const [availableRoles, setAvailableRoles] = useState<{
        id: number,
        name: string,
        rank: number
    }[]>([]);

    const roleCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/employees/roles` : null
        },
        fetch,
        {
            revalidateOnFocus: false
        }
    );

    useEffect(() => {
        if (!roleCache.isLoading
            && roleCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await roleCache.data?.json();
                    if (body.roles) {
                        setAvailableRoles(body.roles);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [roleCache]);

    const timesCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/events/times` : null
        },
        fetch,
        {
            revalidateOnFocus: false
        }
    );

    useEffect(() => {
        if (!timesCache.isLoading
            && timesCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await timesCache.data?.json();
                    if (body.times) {
                        setTimes(body.times);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [timesCache]);

    const typesCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/tickets/types` : null
        },
        fetch,
        {
            revalidateOnFocus: false
        }
    );

    useEffect(() => {
        if (!typesCache.isLoading
            && typesCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await typesCache.data?.json();
                    if (body.types) {
                        setTypes(body.types);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [typesCache]);

    const [saving, setSaving] = useState<boolean>(false);
    const [ticketType, setTicketType] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const save = async () => {
        if (
            !saving
            && group.group
            && group.user
        ) {
            setSaving(true);

            const response = await fetch(
                `/api/groups/${group.group.id}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        ...editableGroup
                    })
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
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

    const add = async () => {
        if (
            group.group
            && group.user
        ) {
            const response = await fetch(
                `/api/groups/${group.group.id}/events/times`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        time
                    })
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    timesCache.mutate();
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            }
        }
    }

    const remove = async (
        id: string
    ) => {
        if (
            group.group
            && group.user
        ) {
            const response = await fetch(
                `/api/groups/${group.group.id}/events/times/${id}`,
                {
                    method: "DELETE"
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    timesCache.mutate()
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            }
        }
    };

    const addType = async () => {
        if (
            group.group
            && group.user
        ) {
            const response = await fetch(
                `/api/groups/${group.group.id}/tickets/types`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        name: ticketType
                    })
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    typesCache.mutate();
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            }
        }
    }

    const removeType = async (
        id: string
    ) => {
        if (
            group.group
            && group.user
        ) {
            const response = await fetch(
                `/api/groups/${group.group.id}/tickets/types/${id}`,
                {
                    method: "DELETE"
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    typesCache.mutate()
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            }
        }
    };

    return (
        group.group
        && group.owner
        && group.user
        && editableGroup
    ) ? (
        <div
            className="flex flex-col gap-4"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <Node
                unlocked
                activated={editableGroup.nodeTracking}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeTracking: event
                    })
                }}
                title={"Time Tracking"}
                onExpand={
                    <div
                        className="grid grid-cols-2 w-full gap-4"
                    >
                        <Input
                            label={"Activity Requirements"}
                            value={editableGroup.activityRequirement?.toString()}
                            type={"number"}
                            onChange={(event) => {
                                setEditableGroup({
                                    ...editableGroup,
                                    activityRequirement: Number(event.target.value)
                                })
                            }}
                            helper={"How many hours each employee should have in game"}
                            className="col-span-2"
                        />
                    </div>
                }
            />
            <Node
                unlocked
                activated={editableGroup.nodeEvents}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeEvents: event
                    })
                }}
                title={"Events"}
                onExpand={
                    <div
                        className="grid grid-cols-2 gap-4 w-full"
                    >
                        <Input
                            label={"Event Requirements"}
                            value={editableGroup.sessionRequirement?.toString()}
                            type={"number"}
                            onChange={(event) => {
                                setEditableGroup({
                                    ...editableGroup,
                                    sessionRequirement: Number(event.target.value)
                                })
                            }}
                            helper={"How many events each employee should host/attend"}
                        />
                        <Input
                            label={"Max Helpers"}
                            value={editableGroup.maxHelpers?.toString()}
                            type={"number"}
                            onChange={(event) => {
                                setEditableGroup({
                                    ...editableGroup,
                                    maxHelpers: Number(event.target.value)
                                })
                            }}
                            helper={"Maximum number of people who can sign up for a session"}
                        />
                        <Select
                            options={availableRoles.map(r => ({
                                display: r.name,
                                value: r.rank.toString()
                            }))}
                            label={"Host Events"}
                            value={editableGroup.hostEvents?.toString()}
                            onChange={(event) => {
                                setEditableGroup({
                                    ...editableGroup,
                                    hostEvents: Number(event.target.value)
                                })
                            }}
                        />
                        <Select
                            options={availableRoles.map(r => ({
                                display: r.name,
                                value: r.rank.toString()
                            }))}
                            label={"Join Events"}
                            value={editableGroup.joinEvents?.toString()}
                            onChange={(event) => {
                                setEditableGroup({
                                    ...editableGroup,
                                    joinEvents: Number(event.target.value)
                                })
                            }}
                        />
                        <div
                            className="col-span-2 flex flex-col w-full gap-2"
                        >
                            <div
                                className="flex flex-row w-full gap-4"
                            >
                                <Input
                                    label={"Session Times"}
                                    value={time}
                                    type={"time"}
                                    onChange={(event) => {
                                        setTime(event.target.value)
                                    }}
                                    helper={"Times that users can create sessions at"}
                                    className="w-full"
                                />
                                <button
                                    className="text-indigo-50 text-sm font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                    disabled={saving}
                                    onClick={() => {
                                        add();
                                    }}
                                >Add</button>
                            </div>
                            <div
                                className="flex flex-wrap gap-2"
                            >
                                {
                                    times.map(t => (
                                        <div
                                            key={t.id}
                                            className="px-2 py-1 w-fit flex flex-row gap-2 bg-indigo-500 rounded-full"
                                        >
                                            <span
                                                className="text-indigo-50 text-xs font-semibold my-auto"
                                            >{t.display}</span>
                                            <HiX
                                                className="text-indigo-50 my-auto cursor-pointer"
                                                onClick={() => {
                                                    remove(t.id);
                                                }}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                }
            />
            <Node
                unlocked
                activated={editableGroup.nodeVacations}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeVacations: event
                    })
                }}
                title={"Vacations & Time Off"}
                onExpand={
                    <></>
                }
            />
            <Node
                unlocked
                activated={editableGroup.nodeAlerts}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeAlerts: event
                    })
                }}
                title={"Alerts"}
                onExpand={
                    <div
                        className="grid grid-cols-1 gap-4 w-full"
                    >
                        <Input
                            label={"Terminate Threshold"}
                            value={editableGroup.terminateAlerts.toString()}
                            type={"number"}
                            onChange={(event) => {
                                setEditableGroup({
                                    ...editableGroup,
                                    terminateAlerts: Number(event.target.value)
                                })
                            }}
                            helper={"How many warnings someone can get before an automatic termination"}
                        />
                        <TextArea
                            label={"Warning Description"}
                            value={editableGroup.defaultWarning}
                            onChange={(event) => {
                                if (event.target.value.length <= 300) {
                                    setEditableGroup({
                                        ...editableGroup,
                                        defaultWarning: event.target.value
                                    })
                                }
                            }}
                            helper={`${editableGroup.defaultWarning.length}/300`}
                        />
                        <TextArea
                            label={"Termination Description"}
                            value={editableGroup.defaultTermination}
                            onChange={(event) => {
                                if (event.target.value.length <= 300) {
                                    setEditableGroup({
                                        ...editableGroup,
                                        defaultTermination: event.target.value
                                    })
                                }
                            }}
                            helper={`${editableGroup.defaultTermination.length}/300`}
                        />
                    </div>
                }
            />
            <Node
                unlocked={group.group?.unlimited ? true : undefined}
                activated={editableGroup.nodeApplications}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeApplications: event
                    })
                }}
                title={"Applications"}
                onExpand={
                    <></>
                }
            />
            <Node
                unlocked
                activated={editableGroup.nodePartners}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodePartners: event
                    })
                }}
                title={"Partners"}
                onExpand={
                    <></>
                }
            />
            <Node
                unlocked
                activated={editableGroup.nodeAnalytics}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeAnalytics: event
                    })
                }}
                title={"Game Analytics"}
                onExpand={
                    <></>
                }
            />
            <Node
                unlocked
                activated={editableGroup.nodeBoard}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeBoard: event
                    })
                }}
                title={"Kanban Board"}
                onExpand={
                    <></>
                }
            />
            <Node
                unlocked={group.group?.unlimited ? true : undefined}
                activated={editableGroup.nodeFeedback}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeFeedback: event
                    })
                }}
                title={"Feedback"}
                onExpand={
                    <></>
                }
            />
            <Node
                unlocked={group.group?.unlimited ? true : undefined}
                activated={editableGroup.nodeHelpdesk}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeHelpdesk: event
                    })
                }}
                title={"Helpdesk"}
                onExpand={
                    <>
                        <div
                            className="col-span-2 flex flex-col w-full gap-2"
                        >
                            <div
                                className="flex flex-row w-full gap-4"
                            >
                                <Input
                                    label={"Ticket Types"}
                                    value={ticketType}
                                    onChange={(event) => {
                                        setTicketType(event.target.value)
                                    }}
                                    helper={"Categories users can create tickets under"}
                                    className="w-full"
                                />
                                <button
                                    className="text-indigo-50 text-sm font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                    disabled={saving}
                                    onClick={() => {
                                        addType();
                                    }}
                                >Add</button>
                            </div>
                            <div
                                className="flex flex-wrap gap-2"
                            >
                                {
                                    types.map(t => (
                                        <div
                                            key={t.id}
                                            className="px-2 py-1 w-fit flex flex-row gap-2 bg-indigo-500 rounded-full"
                                        >
                                            <span
                                                className="text-indigo-50 text-xs font-semibold my-auto"
                                            >{t.name}</span>
                                            <HiX
                                                className="text-indigo-50 my-auto cursor-pointer"
                                                onClick={() => {
                                                    removeType(t.id);
                                                }}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </>
                }
            />
            <Node
                unlocked={group.group?.unlimited ? true : undefined}
                activated={editableGroup.nodeAbuse}
                setActivated={(event) => {
                    setEditableGroup({
                        ...editableGroup,
                        nodeAbuse: event
                    })
                }}
                title={"Anti-Abuse"}
                onExpand={
                    <></>
                }
            />
            <div
                className="flex flex-row justify-end w-full"
            >
                <button
                    className="text-indigo-50 bg-indigo-500 rounded-full shadow-sm px-4 py-2 text-sm font-semibold cursor-pointer hover:shadow-md hover:bg-indigo-600 transition duration-200"
                    onClick={save}
                    disabled={saving}
                >Save</button>
            </div>
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
