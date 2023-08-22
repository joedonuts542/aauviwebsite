import useSWR from "swr";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { useGroup } from "@/app/client/groups/group";

import { QuestionType } from "@prisma/client";
import { Checkbox, Input, Select, TextArea } from "@/components/form/TextInput";
import { HiArrowDown, HiArrowUp, HiDotsVertical, HiTrash, HiX } from "react-icons/hi";
import { Dropdown } from "@/components/form/Dropdown";
import toast from "react-hot-toast";

export type NewQuestion = {
    title?: string,
    description?: string,
    type?: QuestionType,
    options?: string[],
    correct?: string,
    required?: boolean,
    weight?: number
}

export type NewApplication = {
    title?: string,
    description?: string,
    submitText?: string,
    quiz?: boolean,
    questions?: NewQuestion[],
}

const Question = (props: {
    index: number,
    app: NewApplication,
    setApp: React.Dispatch<React.SetStateAction<NewApplication>>,
}) => {
    const [menu, setMenu] = useState<boolean>(false);

    return (props.app.questions) ? (
        <div
            className="flex flex-col p-8 rounded-md shadow-md bg-indigo-50 w-full gap-4"
        >
            <div
                className="flex flex-row w-full justify-between mb-[-1rem]"
            >
                <span
                    className="text-indigo-950 text-lg font-semibold my-auto"
                >Question #{props.index + 1}</span>
                <div
                    className="relative flex my-auto rounded-full w-8 h-8 p-2 bg-inherit text-indigo-950 hover:text-indigo-50 hover:bg-indigo-500 hover:shadow-sm transition duration-200"
                >
                    <HiDotsVertical
                        className="my-auto mx-auto"
                        onClick={() => {
                            setMenu(!menu);
                        }}
                    />
                    <Dropdown
                        isOpen={menu}
                        onClose={() => {
                            setMenu(!menu);
                        }}
                        options={[
                            {
                                key: "up",
                                display: (
                                    <div
                                        className="flex flex-row gap-2"
                                    >
                                        <HiArrowUp className="my-auto" />
                                        <span>Move Up</span>
                                    </div>
                                ),
                                onClick: (onClose) => {
                                    if (props.app.questions) {
                                        if (props.app.questions.length > 1 && props.index >= 1) {
                                            let questions = props.app.questions ? [...props.app.questions] : []
                                            let question = questions[props.index];
                                            questions[props.index] = questions[props.index - 1];
                                            questions[props.index - 1] = question;
                                            props.setApp({
                                                ...props.app,
                                                questions: questions
                                            })
                                        }
                                    }
                                    onClose();
                                }
                            },
                            {
                                key: "down",
                                display: (
                                    <div
                                        className="flex flex-row gap-2"
                                    >
                                        <HiArrowDown className="my-auto" />
                                        <span>Move Down</span>
                                    </div>
                                ),
                                onClick: (onClose) => {
                                    if (props.app.questions) {
                                        if (props.app.questions.length > 1 && props.index < props.app.questions.length - 1) {
                                            let questions = props.app.questions ? [...props.app.questions] : []
                                            let question = questions[props.index];
                                            questions[props.index] = questions[props.index + 1];
                                            questions[props.index + 1] = question;
                                            props.setApp({
                                                ...props.app,
                                                questions: questions
                                            })
                                        }
                                    }
                                    onClose();
                                }
                            },
                            {
                                key: "delete",
                                display: (
                                    <div
                                        className="flex flex-row gap-2"
                                    >
                                        <HiTrash className="my-auto" />
                                        <span>Delete</span>
                                    </div>
                                ),
                                onClick: (onClose) => {
                                    if (props.app.questions) {
                                        let questions = props.app.questions ? [...props.app.questions] : [];
                                        questions.splice(props.index, 1)
                                        props.setApp({
                                            ...props.app,
                                            questions: questions
                                        })
                                    }
                                    onClose();
                                }
                            }
                        ]}
                    />
                </div>
            </div>
            <div
                className="flex flex-row gap-4 w-full"
            >
                <Input
                    label={"Question"}
                    value={props.app.questions[props.index].title || ""}
                    onChange={(event) => {
                        if (props.app.questions) {
                            let questions = props.app.questions ? [...props.app.questions] : []
                            let question = questions[props.index];
                            question.title = event.target.value;
                            props.setApp({
                                ...props.app,
                                questions: questions
                            })
                        }
                    }}
                    className="w-full"
                />
                <Select
                    options={["TEXT", "SELECT", "CHECK"].map(q => ({
                        display: `${q[0]}${q.substring(1).toLowerCase()}`,
                        value: q
                    }))}
                    label={"Type"}
                    value={props.app.questions[props.index].type || ""}
                    onChange={(event) => {
                        if (props.app.questions) {
                            let questions = props.app.questions ? [...props.app.questions] : []
                            let question = questions[props.index];
                            question.type = event.target.value as QuestionType;
                            props.setApp({
                                ...props.app,
                                questions: questions
                            })
                        }
                    }}
                />
            </div>
            {
                (props.app.quiz && (props.app.questions[props.index].type?.toString() === "CHECK" || props.app.questions[props.index].type?.toString() === "SELECT"))
                && <div
                    className="flex flex-row gap-4 w-full"
                >
                    <Input
                        label={"Weight"}
                        value={props.app.questions[props.index].weight?.toString() || ""}
                        type={"number"}
                        onChange={(event) => {
                            if (props.app.questions) {
                                let questions = props.app.questions ? [...props.app.questions] : []
                                let question = questions[props.index];
                                question.weight = Number(event.target.value) > 0 ? Number(event.target.value) : 0;
                                props.setApp({
                                    ...props.app,
                                    questions: questions
                                })
                            }
                        }}
                        className="w-full"
                    />
                    <Select
                        options={
                            (
                                props.app.questions
                                && props.app.questions[props.index].options
                            ) ? (
                                props.app.questions[props.index].options!.map(o => ({
                                    display: o,
                                    value: o
                                }))
                            ) : []
                        }
                        label={"Answer"}
                        value={props.app.questions[props.index].type || ""}
                        onChange={(event) => {
                            if (props.app.questions) {
                                let questions = props.app.questions ? [...props.app.questions] : []
                                let question = questions[props.index];
                                question.correct = event.target.value;
                                props.setApp({
                                    ...props.app,
                                    questions: questions
                                })
                            }
                        }}
                    />
                </div>
            }
            <TextArea
                label={"Description"}
                value={props.app.questions[props.index].description || ""}
                onChange={(event) => {
                    if (props.app.questions && event.target.value.length < 200) {
                        let questions = props.app.questions ? [...props.app.questions] : []
                        let question = questions[props.index];
                        question.description = event.target.value;
                        props.setApp({
                            ...props.app,
                            questions: questions
                        })
                    }
                }}
                helper={`${props.app.questions[props.index].description?.length || 0}/200`}
            />
            {
                (props.app.questions[props.index].type === "CHECK" || props.app.questions[props.index].type === "SELECT")
                && <div
                    className="flex flex-col gap-2 w-full"
                >
                    {
                        props.app.questions[props.index].options?.map((o, i) => (
                            <div
                                key={o}
                                className="flex flex-row w-full justify-between gap-4"
                            >
                                <Input
                                    value={o}
                                    onChange={(event) => {
                                        if (props.app.questions) {
                                            let questions = props.app.questions ? [...props.app.questions] : []
                                            let question = questions[props.index];
                                            if (
                                                question.options
                                            ) {
                                                question.options[i] = event.target.value;
                                                props.setApp({
                                                    ...props.app,
                                                    questions: questions
                                                })
                                            }
                                        }
                                    }}
                                    className="my-auto"
                                />
                                <div
                                    className="flex flex-col p-2 my-auto rounded-full bg-inherit hover:bg-indigo-500 text-indigo-800 hover:text-indigo-50 transition duration-200"
                                    onClick={() => {
                                        if (props.app.questions) {
                                            let questions = props.app.questions ? [...props.app.questions] : [];
                                            if (questions[props.index].options) {
                                                questions[props.index].options?.splice(i, 1);
                                            }
                                            props.setApp({
                                                ...props.app,
                                                questions: questions
                                            })
                                        }
                                    }}
                                >
                                    <HiX
                                        className="my-auto mx-auto"
                                    />
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
            <div
                className="flex flex-row gap-4 w-full"
            >
                {
                    ((props.app.quiz && (props.app.questions[props.index].type?.toString() === "CHECK" || props.app.questions[props.index].type?.toString() === "SELECT")) || !props.app.quiz)
                    && <div
                        className="flex flex-row gap-2 my-auto w-fit"
                    >
                        <Checkbox
                            value={props.app.questions[props.index].required || false}
                            size={5}
                            onChange={(event) => {
                                if (props.app.questions && event.target.value.length < 200) {
                                    let questions = props.app.questions ? [...props.app.questions] : []
                                    let question = questions[props.index];
                                    question.required = event.target.checked;
                                    props.setApp({
                                        ...props.app,
                                        questions: questions
                                    })
                                }
                            }}
                            className="my-auto"
                        />
                        <span
                            className="text-indigo-950 text-sm my-auto"
                        >Required</span>
                    </div>
                }
                {
                    (props.app.questions[props.index].type?.toString() === "CHECK" || props.app.questions[props.index].type?.toString() === "SELECT")
                    && <button
                        className="my-auto px-4 py-2 rounded-full bg-indigo-500 text-indigo-50 text-xs font-semibold hover:bg-indigo-600 transition duration-200"
                        onClick={() => {
                            if (props.app.questions) {
                                let questions = props.app.questions ? [...props.app.questions] : [];
                                if (questions[props.index].options) {
                                    questions[props.index].options?.push("");
                                } else {
                                    questions[props.index].options = [""];
                                }
                                props.setApp({
                                    ...props.app,
                                    questions: questions
                                })
                            }
                        }}
                    >Add Option</button>
                }
            </div>
        </div>
    ) : undefined
}

export const CreateApp = () => {
    const pathname = usePathname();
    const router = useRouter();
    const group = useGroup();

    const [app, setApp] = useState<NewApplication>({
        submitText: "Thank you, your response has now been recorded!"
    });

    const [creating, setCreating] = useState<boolean>(false);
    const create = async () => {
        if (!creating && group.group && app) {
            setCreating(true);
            const response = await fetch(
                `/api/groups/${group.group.id}/apps`,
                {
                    method: "POST",
                    body: JSON.stringify(app)
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        router.replace(`/client/groups/${group.group.id}/apps`);
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot run a new archive.")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setCreating(false);
            }
        }
    }

    return (
        <div
            className="flex flex-col gap-4"
        >
            <div
                className="flex flex-col gap-4 bg-indigo-50 rounded-md shadow-md p-8 w-full"
            >
                <div
                    className="flex flex-row w-full gap-4"
                >
                    <Input
                        label={"Application Title"}
                        value={app.title}
                        onChange={(event) => {
                            setApp({
                                ...app,
                                title: event.target.value
                            })
                        }}
                    />
                </div>
                <TextArea
                    label={"Description"}
                    value={app.description}
                    onChange={(event) => {
                        if (event.target.value.length < 300) {
                            setApp({
                                ...app,
                                description: event.target.value
                            })
                        }
                    }}
                    helper={`${app.description?.length || 0}/300`}
                />
                <div
                    className="flex flex-row gap-4 justify-between"
                >
                    <div
                        className="flex flex-row gap-2 my-auto w-fit"
                    >
                        <Checkbox
                            value={app.quiz}
                            size={5}
                            onChange={(event) => {
                                setApp({
                                    ...app,
                                    quiz: event.target.checked
                                })
                            }}
                            className="my-auto"
                        />
                        <span
                            className="text-indigo-950 text-sm my-auto"
                        >Quiz Mode</span>
                    </div>
                    <div
                        className="flex flex-row gap-4"
                    >
                        <button
                            type="button"
                            className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                            onClick={create}
                            disabled={creating}
                        >Create</button>
                        <Link
                            href={`${pathname.replace("/new", "")}`}
                            className="flex flex-col px-4 py-2 text-sm border-0 rounded-md bg-inherit text-indigo-950 hover:bg-indigo-200 transition duration-200"
                        >Cancel</Link>
                    </div>
                </div>
            </div>
            {
                app.questions && app.questions.map((q, i) => (
                    <Question
                        key={i}
                        index={i}
                        app={app}
                        setApp={setApp}
                    />
                ))
            }
            <div
                className="flex flex-col gap-2 bg-inherit rounded-md hover:bg-indigo-400 hover:bg-opacity-30 transition duration-200 cursor-pointer mx-auto p-8 w-96"
                onClick={() => {
                    setApp({
                        ...app,
                        questions: app.questions ? [...app.questions, {}] : [{}]
                    })
                }}
            >
                <span
                    className="text-indigo-950 text-lg font-semibold mx-auto"
                >Add Question</span>
                <span
                    className="text-indigo-950 text-xs mx-auto"
                >Click to add a new question</span>
            </div>
            <div
                className="flex flex-col gap-4 bg-indigo-50 rounded-md shadow-md p-8 w-full"
            >
                <TextArea
                    label={"Success Message"}
                    value={app.submitText}
                    onChange={(event) => {
                        if (event.target.value.length < 100) {
                            setApp({
                                ...app,
                                submitText: event.target.value
                            })
                        }
                    }}
                    helper={`${app.submitText?.length || 0}/100`}
                />
            </div>
        </div>
    )
}