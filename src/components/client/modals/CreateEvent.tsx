import { useEffect, useState } from "react";

import { Modal } from "@/components/form/Modal";
import { Input, Select, TextArea } from "@/components/form/TextInput";
import { groupContext } from "@/app/client/groups/group";
import { userContext } from "@/app/client/auth";

import toast from "react-hot-toast";
import { DateTime } from "luxon";
import { EventType, Group, GroupEvent, GroupTimes } from "@prisma/client";

type newGroupEvent = {
    title?: string,
    description?: string,
    location?: string,
    type?: EventType,
    date?: string,
    start?: string,
    end?: string
}

export const CreateEvent = (props: {
    isOpen: boolean,
    onClose: () => void,
    refresh: () => void,
    group: Group,
    times: GroupTimes[],
    events: GroupEvent[]
}) => {
    const [creating, setCreating] = useState<boolean>(false);
    const [newEvent, setNewEvent] = useState<newGroupEvent>({});

    const create = async () => {
        if (!creating && props.group) {
            setCreating(true);
            const response = await fetch(
                `/api/groups/${props.group.id}/events`,
                {
                    body: JSON.stringify({
                        ...newEvent,
                        start: new Date(`${newEvent.date} ${newEvent.start}`),
                        end: new Date(`${newEvent.date} ${newEvent.end}`)
                    }),
                    method: "POST"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        props.refresh();
                        props.onClose();
                        setNewEvent({});
                        toast.success("Successfully created a new event!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot create new event")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setCreating(false);
            }
        }
    }

    const [times, setTimes] = useState<GroupTimes[]>([]);
    useEffect(() => {
        if (!newEvent.date) {
            setTimes(props.times)
        } else {
            let openTimes: GroupTimes[] = [];
            for (let i = 0; i < props.times.length; i++) {
                let time = new Date(`${newEvent.date} ${props.times[i].value}`);
                console.log(time.toISOString())
                let index = props.events.findIndex(e => new Date(e.start).toISOString() === time.toISOString())
                if (index < 0) {
                    openTimes.push(props.times[i]);
                }
            }

            setTimes(openTimes);
        }
    }, [props.times, newEvent.date])

    return (props.group) ? (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={"New Event"}
            body={
                <div
                    className="grid grid-cols-2 gap-4"
                >
                    <Input
                        label={"Title"}
                        value={newEvent.title || ""}
                        onChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                title: event.target.value
                            })
                        }}
                        className="col-span-2"
                    />
                    <Select
                        options={[
                            {
                                display: "Session",
                                value: "SESSION"
                            },
                            {
                                display: "Training",
                                value: "TRAINING"
                            },
                            {
                                display: "Meeting",
                                value: "MEETING"
                            }
                        ]}
                        label={"Type"}
                        value={newEvent.type || ""}
                        onChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                type: event.target.value as EventType
                            })
                        }}
                    />
                    <Input
                        label={"Date"}
                        type={"date"}
                        value={newEvent.date || ""}
                        onChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                date: event.target.value
                            })
                        }}
                    />
                    <Select
                        options={times.map(t => ({
                            display: t.display,
                            value: t.value
                        }))}
                        label={"Start Time"}
                        value={newEvent.start || ""}
                        onChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                start: event.target.value
                            })
                        }}
                    />
                    <Input
                        label={"End Time"}
                        type={"time"}
                        value={newEvent.end || ""}
                        onChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                end: event.target.value
                            })
                        }}
                    />
                    <Input
                        label={"Location"}
                        value={newEvent.location || ""}
                        onChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                location: event.target.value
                            })
                        }}
                        helper={"A link to the Roblox game"}
                        className="col-span-2"
                    />
                    <TextArea
                        label={"Description"}
                        value={newEvent.description || ""}
                        onChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                description: event.target.value
                            })
                        }}
                        className="col-span-2"
                    />
                </div>
            }
            footer={
                <>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                        onClick={create}
                        disabled={creating}
                    >Create</button>
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                        onClick={() => {
                            props.onClose();
                            setNewEvent({});
                        }}
                    >Cancel</button>
                </>
            }
        />
    ) : undefined
}