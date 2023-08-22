import useSWR from "swr";
import { useState, useEffect } from "react";

import type {
    CardStatus,
    CardTask,
    CardType,
    GroupCard,
    User
} from "@prisma/client";
import { useGroup } from "@/app/client/groups/group";
import { useAuth } from "@/app/client/auth";
import { DateTime, Duration } from "luxon";
import { Modal } from "../form/Modal";
import { Checkbox, Input, Select, TextArea } from "../form/TextInput";
import toast from "react-hot-toast";
import Link from "next/link";

type CardDetails = GroupCard & {
    tasks: CardTask[];
    author: User
}

type newCard = {
    title?: string,
    description?: string,
    type?: CardType,
    links?: string[],
    dueAt?: string,
    tasks?: string[]
}

const Task = (props: {
    task: CardTask,
    groupId: string
}) => {
    const [checked, setChecked] = useState<boolean>(props.task.completed);
    useEffect(() => {
        if (checked !== props.task.completed) {
            fetch(
                `/api/groups/${props.groupId}/cards/task/${props.task.id}`,
                {
                    body: JSON.stringify({
                        completed: checked
                    }),
                    method: "POST"
                }
            ).then(async (response) => {
                try {
                    const body = await response.json();
                    if (body) {
                        if (body.data) {
                            toast.success("Successfully updated this card!")
                        } else {
                            throw Error(body.error);
                        }
                    } else {
                        throw Error("Cannot update this card")
                    }
                } catch (error) {
                    toast.error(error!.toString())
                }
            }).catch(async (error) => {
                toast.error(error!.toString())
            })
        }
    }, [checked]);

    return (
        <div
            className="flex flex-row gap-2 p-2 rounded-md bg-indigo-100"
        >
            <Checkbox
                value={checked}
                onChange={(event) => {
                    setChecked(event.target.checked);
                }}
                size={4}
                className="my-auto"
            />
            <span
                className="text-indigo-950 text-xs font-semibold my-auto"
            >{props.task.name}</span>
        </div>
    )
}

const Card = (props: {
    card: CardDetails
    onClick: () => void;
    onDragEnd?: () => void;
}) => {
    return (
        <div
            className="flex flex-col gap-2 p-4 rounded-md shadow-md bg-indigo-50 cursor-pointer select-none"
            draggable
            onClick={props.onClick}
            onDragEnd={props.onDragEnd}
        >
            <div
                className="flex flex-row gap-2 w-full overflow-x-hidden"
            >
                <span
                    className="text-indigo-950 text-sm font-semibold my-auto truncate"
                >{props.card.title}</span>
                {
                    props.card.dueAt
                    && <span
                        className={`text-indigo-50 text-[0.55rem] leading-4 font-semibold ${Duration.fromMillis(new Date(props.card.dueAt).getTime() - Date.now()).get("days") <= 5 ? "bg-orange-500" : "bg-green-500"} rounded-full px-2 py-0.5 my-auto w-fit`}
                    >
                        {
                            new Date(props.card.dueAt).getTime() < Date.now()
                                ? DateTime.fromJSDate(new Date(props.card.dueAt)).toFormat("LLL L")
                                : Duration.fromMillis(new Date(props.card.dueAt).getTime() - Date.now()).toFormat("d 'days'")
                        }
                    </span>
                }
            </div>
            <div
                className="flex flex-row gap-4 overflow-x-hidden w-full"
            >
                <span
                    className="text-indigo-950 text-xs my-auto"
                >{props.card.type[0]}{props.card.type.substring(1).toLowerCase()}</span>
                {
                    props.card.tasks.length > 0
                    && <span
                        className="text-indigo-950 text-xs my-auto"
                    >{props.card.tasks.filter(t => t.completed).length}/{props.card.tasks.length} Checked</span>
                }
            </div>
        </div>
    )
}

export const GroupSwimlanes = () => {
    const group = useGroup();
    const auth = useAuth();

    const [activeCard, setActiveCard] = useState<CardDetails>();
    const [addModal, setAddModal] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);

    const [dropTitle, setDropTitle] = useState<string>();
    const [newCard, setNewCard] = useState<newCard>({});
    const [cards, setCards] = useState<CardDetails[]>([]);
    const cardsCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/cards` : null
        },
        fetch
    );

    useEffect(() => {
        if (!cardsCache.isLoading
            && cardsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await cardsCache.data?.json();
                    if (body.cards) {
                        setCards(body.cards);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [cardsCache])

    const refresh = () => {
        cardsCache.mutate();
    }

    const [creating, setCreating] = useState<boolean>(false);
    const create = async () => {
        if (!creating && group.group) {
            setCreating(true);
            const response = await fetch(
                `/api/groups/${group.group.id}/cards`,
                {
                    body: JSON.stringify({
                        ...newCard
                    }),
                    method: "POST"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        refresh();
                        setNewCard({});
                        toast.success("Successfully created a new card!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot create new card")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setCreating(false);
            }
        }
    }

    const [deleting, setDeleting] = useState<boolean>(false);
    const deleteCard = async (
        cardId: string
    ) => {
        if (!creating && group.group) {
            setCreating(true);
            const response = await fetch(
                `/api/groups/${group.group.id}/cards/${cardId}`,
                {
                    method: "DELETE"
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        refresh();
                        setActiveCard(undefined);
                        toast.success("Successfully deleted this card!")
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot delete this card")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setCreating(false);
            }
        }
    }

    const [link, setLink] = useState<string>("");
    const addLink = async () => {
        if (link.includes("http")) {
            if (newCard.links) {
                if (newCard.links.length < 3) {
                    setNewCard({
                        ...newCard,
                        links: [
                            ...newCard.links,
                            link
                        ]
                    })
                    setLink("");
                } else {
                    toast.error("There are a maximum of three links");
                }
            } else {
                setNewCard({
                    ...newCard,
                    links: [link]
                })
                setLink("");
            }
        } else {
            toast.error("Must be a valid URL");
        }
    }

    const onDropComplete = async (
        cardId: string
    ) => {
        if (dropTitle && group.group) {
            let edited = [...cards];
            let index = edited.findIndex(c => c.id === cardId);
            if (index >= 0) {
                edited[index].status = dropTitle as CardStatus;
                setCards(edited);

                const response = await fetch(
                    `/api/groups/${group.group.id}/cards/${cardId}`,
                    {
                        body: JSON.stringify({
                            status: dropTitle
                        }),
                        method: "POST"
                    }
                );
    
                try {
                    const body = await response.json();
                    if (body) {
                        if (body.data) {
                            refresh();
                            setActiveCard(undefined);
                            toast.success("Successfully moved this card!")
                        } else {
                            throw Error(body.error);
                        }
                    } else {
                        throw Error("Cannot move this card")
                    }
                } catch (error) {
                    toast.error(error!.toString())
                } finally {
                    setCreating(false);
                }
            }
        }
    }

    return (
        <div
            className="flex flex-col gap-4"
        >
            <div
                className="flex flex-row w-full justify-between"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold"
                >Development Progress</span>
                <span
                    className="text-indigo-50 bg-indigo-500 rounded-full shadow-sm px-4 py-2 text-sm font-semibold cursor-pointer hover:shadow-md hover:bg-indigo-600 transition duration-200"
                    onClick={() => {
                        setAddModal(true)
                    }}
                > + New Card </span>
            </div>
            <div
                className="flex flex-row w-full gap-4"
            >
                <div
                    className="flex flex-col p-4 w-full gap-2 bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200 h-fit"
                    onDragOver={() => {
                        if (dropTitle !== "TO_DO") {
                            setDropTitle("TO_DO");
                        }
                    }}
                >
                    <span
                        className="text-indigo-950 text-md font-semibold"
                    >To-do</span>
                    <div
                        className="flex flex-col gap-2 p-2 rounded-md bg-indigo-100"
                    >
                        {
                            cards.filter(c => c.status === "TO_DO").map(c => (
                                <Card
                                    key={c.id}
                                    card={c}
                                    onClick={() => {
                                        setActiveCard(c);
                                        setModal(true);
                                    }}
                                    onDragEnd={() => {
                                        onDropComplete(c.id);
                                    }}
                                />
                            ))
                        }
                    </div>
                </div>
                <div
                    className="flex flex-col p-4 w-full gap-2 bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200 h-fit"
                    onDragOver={() => {
                        if (dropTitle !== "IN_PROGRESS") {
                            setDropTitle("IN_PROGRESS");
                        }
                    }}
                >
                    <span
                        className="text-indigo-950 text-md font-semibold"
                    >In Progress</span>
                    <div
                        className="flex flex-col gap-2 p-2 rounded-md bg-indigo-100"
                    >
                        {
                            cards.filter(c => c.status === "IN_PROGRESS").map(c => (
                                <Card
                                    key={c.id}
                                    card={c}
                                    onClick={() => {
                                        setActiveCard(c);
                                        setModal(true);
                                    }}
                                    onDragEnd={() => {
                                        onDropComplete(c.id);
                                    }}
                                />
                            ))
                        }
                    </div>
                </div>
                <div
                    className="flex flex-col p-4 w-full gap-2 bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200 h-fit"
                    onDragOver={() => {
                        if (dropTitle !== "IN_TESTING") {
                            setDropTitle("IN_TESTING");
                        }
                    }}
                >
                    <span
                        className="text-indigo-950 text-md font-semibold"
                    >In Testing</span>
                    <div
                        className="flex flex-col gap-2 p-2 rounded-md bg-indigo-100"
                    >
                        {
                            cards.filter(c => c.status === "IN_TESTING").map(c => (
                                <Card
                                    key={c.id}
                                    card={c}
                                    onClick={() => {
                                        setActiveCard(c);
                                        setModal(true);
                                    }}
                                    onDragEnd={() => {
                                        onDropComplete(c.id);
                                    }}
                                />
                            ))
                        }
                    </div>
                </div>
                <div
                    className="flex flex-col p-4 w-full gap-2 bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200 h-fit"
                    onDragOver={() => {
                        if (dropTitle !== "COMPLETED") {
                            setDropTitle("COMPLETED");
                        }
                    }}
                >
                    <span
                        className="text-indigo-950 text-md font-semibold"
                    >Completed</span>
                    <div
                        className="flex flex-col gap-2 p-2 rounded-md bg-indigo-100"
                    >
                        {
                            cards.filter(c => c.status === "COMPLETED").map(c => (
                                <Card
                                    key={c.id}
                                    card={c}
                                    onClick={() => {
                                        setActiveCard(c);
                                        setModal(true);
                                    }}
                                    onDragEnd={() => {
                                        onDropComplete(c.id);
                                    }}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
            <Modal
                isOpen={addModal}
                onClose={() => {
                    setAddModal(false);
                }}
                title={"New Card"}
                body={
                    <div
                        className="grid grid-cols-2 gap-5 w-full"
                    >
                        <Input
                            label={"Title"}
                            value={newCard.title || ""}
                            onChange={(event) => {
                                setNewCard({
                                    ...newCard,
                                    title: event.target.value
                                })
                            }}
                            className={"col-span-2"}
                        />
                        <Select
                            options={[
                                {
                                    display: "Suggestion",
                                    value: "SUGGESTION"
                                },
                                {
                                    display: "Deployment",
                                    value: "DEPLOYMENT"
                                },
                                {
                                    display: "Release",
                                    value: "RELEASE"
                                },
                                {
                                    display: "Feature",
                                    value: "FEATURE"
                                },
                                {
                                    display: "Event",
                                    value: "EVENT"
                                },
                                {
                                    display: "Bug",
                                    value: "BUG"
                                }
                            ]}
                            label={"Card Type"}
                            value={newCard.type}
                            onChange={(event) => {
                                setNewCard({
                                    ...newCard,
                                    type: event.target.value as CardType
                                })
                            }}
                        />
                        <Input
                            label={"Due At"}
                            value={newCard.dueAt}
                            type={"datetime-local"}
                            onChange={(event) => {
                                setNewCard({
                                    ...newCard,
                                    dueAt: event.target.value
                                })
                            }}
                        />
                        <div
                            className="flex flex-col w-full gap-2 col-span-2"
                        >
                            <div
                                className="flex flex-row gap-4"
                            >
                                <Input
                                    label={"Links"}
                                    value={link || ""}
                                    onChange={(event) => {
                                        setLink(event.target.value)
                                    }}
                                    className={"w-full"}
                                />
                                <span
                                    className="text-indigo-50 text-xs font-semibold px-4 py-2 mt-auto mb-1 bg-indigo-500 rounded-full hover:bg-indigo-600 transition duration-200 cursor-pointer"
                                    onClick={() => {
                                        addLink()
                                    }}
                                >Add</span>
                            </div>
                            {
                                newCard.links
                                && newCard.links.map(l => (
                                    <a
                                        key={l}
                                        className={"text-indigo-500 text-xs"}
                                        href={l}
                                    >{l}</a>
                                ))
                            }
                        </div>
                        <div
                            className="flex flex-col gap-4 col-span-2"
                        >
                            {
                                newCard.tasks
                                && newCard.tasks.map((t, i) => (
                                    <Input
                                        key={i}
                                        value={newCard.tasks![i]}
                                        onChange={(event) => {
                                            let tasks = newCard.tasks
                                            if (tasks) {
                                                tasks[i] = event.target.value
                                                setNewCard({
                                                    ...newCard,
                                                    tasks
                                                })
                                            }
                                        }}
                                    />
                                ))
                            }
                            <span
                                className="text-indigo-50 text-sm font-semibold text-center py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 transition duration-200 cursor-pointer"
                                onClick={() => {
                                    setNewCard({
                                        ...newCard,
                                        tasks: newCard.tasks ? [...newCard.tasks, "New Task"] : ["New Task"]
                                    })
                                }}
                            >Add Task</span>
                        </div>
                        <TextArea
                            label={"Description"}
                            value={newCard.description}
                            onChange={(event) => {
                                if (event.target.value.length <= 3000) {
                                    setNewCard({
                                        ...newCard,
                                        description: event.target.value
                                    });
                                }
                            }}
                            helper={`${newCard.description?.length || 0}/3000 Characters`}
                            className={"col-span-2"}
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
                                setAddModal(false)
                                setNewCard({});
                            }}
                        >Cancel</button>
                    </>
                }
            />
            {
                activeCard
                && <Modal
                    isOpen={modal}
                    onClose={() => {
                        setModal(false);
                    }}
                    title={activeCard.title}
                    body={
                        <div
                            className="flex flex-row w-full gap-8"
                        >
                            <div
                                className="flex flex-col w-[-webkit-fill-available] gap-4"
                            >
                                {
                                    activeCard.dueAt
                                    && <div
                                        className="flex flex-row gap-2 mb-[-1rem]"
                                    >
                                        <span
                                            className="text-indigo-950 text-xs font-semibold"
                                        >Due At: </span>
                                        <span
                                            className="text-indigo-950 text-xs"
                                        >{DateTime.fromJSDate(new Date(activeCard.dueAt)).toFormat("fff")}</span>
                                    </div>
                                }
                                <div
                                    className="flex flex-col"
                                >
                                    <span
                                        className="text-indigo-950 text-md font-semibold"
                                    >Description</span>
                                    <span
                                        className="text-indigo-950 text-xs"
                                    >{activeCard.description}</span>
                                </div>
                                <div
                                    className="flex flex-col"
                                >
                                    <span
                                        className="text-indigo-950 text-md font-semibold"
                                    >Tasks</span>
                                    {
                                        activeCard.tasks.length > 0
                                            ? <div
                                                className="flex flex-col gap-2"
                                            >
                                                {
                                                    activeCard.tasks.map(c => (
                                                        <Task
                                                            key={c.id}
                                                            task={c}
                                                            groupId={group.group!.id}
                                                        />
                                                    ))
                                                }
                                            </div>
                                            : <span
                                                className="text-indigo-950 text-xs"
                                            >No tasks added</span>
                                    }
                                </div>
                            </div>
                            <div
                                className="flex flex-col gap-4 w-fit min-w-[64px]"
                            >
                                {
                                    activeCard.links.length > 0
                                    && <div
                                        className="flex flex-col"
                                    >
                                        <span
                                            className="text-indigo-950 text-sm font-semibold"
                                        >Links</span>
                                        {
                                            activeCard.links.map((l, i) => (
                                                <Link
                                                    key={i}
                                                    className="text-indigo-500 text-xs"
                                                    href={l}
                                                >Link {i + 1}</Link>
                                            ))
                                        }
                                    </div>
                                }
                                <div
                                    className="flex flex-col"
                                >
                                    <span
                                        className="text-indigo-950 text-sm font-semibold"
                                    >Author</span>
                                    <span
                                        className="text-indigo-950 text-xs"
                                    >{activeCard.author.name}</span>
                                </div>
                                <div
                                    className="flex flex-col"
                                >
                                    <span
                                        className="text-indigo-950 text-sm font-semibold"
                                    >Type</span>
                                    <span
                                        className="text-indigo-950 text-xs"
                                    >{activeCard.type[0]}{activeCard.type.substring(1).toLowerCase()}</span>
                                </div>
                                <div
                                    className="flex flex-col"
                                >
                                    <span
                                        className="text-indigo-950 text-sm font-semibold"
                                    >Status</span>
                                    <span
                                        className="text-indigo-950 text-xs"
                                    >{`${activeCard.status[0]}${activeCard.status.substring(1).toLowerCase()}`.split("_").join(" ")}</span>
                                </div>
                            </div>
                        </div>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-red-500 text-indigo-50 hover:bg-red-600 transition duration-200"
                                disabled={deleting}
                                onClick={() => {
                                    deleteCard(activeCard.id)
                                }}
                            >Delete</button>
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                                onClick={() => {
                                    setModal(false);
                                }}
                            >Close</button>
                        </>
                    }
                />
            }
        </div>
    )
}