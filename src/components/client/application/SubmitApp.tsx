import useSWR from "swr";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/client/auth";

import {
    ApplicationInstance,
    GroupApplication,
    QuestionType
} from "@prisma/client";
import { NewApplicationInstance } from "@/app/api/apps/[appId]/route";
import { MoonLoader } from "react-spinners";
import { Logo } from "@/components/content/Logo";
import Link from "next/link";
import { TextArea } from "@/components/form/TextInput";
import { MultipleChoice } from "@/components/form/MultipleChoice";
import toast from "react-hot-toast";

export type ApplicationDetails = GroupApplication & {
    questions: {
        id: string,
        title: string,
        description?: string,
        type: QuestionType,
        options: string[]
    }[],
    group: {
        name: string,
        description: string,
        groupId: string
    }
}

export type InstanceDetails = ApplicationInstance & {
    application: GroupApplication & {
        group: {
            name: string,
            description: string,
            groupId: string
        }
    }
}

export const SubmitApp = () => {
    const { appId } = useParams();
    const router = useRouter();
    const auth = useAuth();

    const [app, setApp] = useState<ApplicationDetails>();
    const [newApp, setNewApp] = useState<NewApplicationInstance>({
        questions: []
    });

    const [submitted, setSubmitted] = useState<boolean>(false);
    const [instance, setInstance] = useState<InstanceDetails>();
    const appCache = useSWR(`/api/apps/${appId}`, fetch);
    useEffect(() => {
        if (
            !appCache.isLoading
            && appCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await appCache.data!.json();
                    if (body.app) {
                        if (appCache.data!.status === 200) {
                            setApp(body.app);
                        } else if (appCache.data!.status === 423) {
                            setInstance(body.app);
                        }
                    }
                } catch (error) {

                }
            };

            tryJson();
        }
    }, [appCache]);

    const [submitting, setSubmitting] = useState<boolean>(false);
    const submit = async () => {
        if (!submitting) {
            setSubmitting(true);
            const response = await fetch(
                `/api/apps/${appId}`,
                {
                    method: "POST",
                    body: JSON.stringify(newApp)
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        setSubmitted(true);
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot run a new archive.")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setSubmitting(false);
            }
        }
    }

    return (submitted && app)
        ? (
            <div
                className="flex flex-col gap-4"
            >
                <div
                    className="flex flex-col gap-4 rounded-md shadow-md w-full p-8 bg-indigo-50"
                >
                    <div
                        className="flex flex-row w-full gap-4"
                    >
                        <Logo
                            groupId={app.group.groupId}
                            className="w-12 h-12 rounded-md my-auto"
                            onError={() => (
                                <></>
                            )}
                        />
                        <div
                            className="flex flex-col my-auto"
                        >
                            <div
                                className="flex flex-row gap-4"
                            >
                                <span
                                    className="text-indigo-950 text-lg font-semibold my-auto"
                                >{app.title}</span>
                                {
                                    app.quiz
                                    && <span
                                        className="text-indigo-50 text-xs font-semibold bg-indigo-500 rounded-full px-4 py-2"
                                    >QUIZ MODE</span>
                                }
                            </div>
                            <span
                                className="text-indigo-950 text-sm"
                            >{app.group.name}</span>
                        </div>
                    </div>
                    <div
                        className="flex flex-col"
                    >
                        <span
                            className="text-indigo-950 text-sm"
                        >{app.description}</span>
                        <span
                            className="text-indigo-950 text-xs"
                        >Created on {new Date(app.createdAt).toDateString()} - {app.questions.length} Questions</span>
                    </div>
                </div>
                <div
                    className="flex flex-col gap-4 rounded-md shadow-md w-full p-8 bg-indigo-50"
                >
                    <span
                        className="text-indigo-950 text-sm"
                    >{app.submitText}</span>
                </div>
                <div
                    className="flex flex-row justify-end"
                >
                    <Link
                        className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                        href={"/client"}
                    >Home</Link>
                </div>
            </div>
        )
        : (app)
            ? !app.isActive
                ? (
                    <div
                        className="flex flex-col gap-4"
                    >
                        <div
                            className="flex flex-col gap-4 rounded-md shadow-md w-full p-8 bg-indigo-50"
                        >
                            <div
                                className="flex flex-row w-full gap-4"
                            >
                                <Logo
                                    groupId={app.group.groupId}
                                    className="w-12 h-12 rounded-md my-auto"
                                    onError={() => (
                                        <></>
                                    )}
                                />
                                <div
                                    className="flex flex-col my-auto"
                                >
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        <span
                                            className="text-indigo-950 text-lg font-semibold my-auto"
                                        >{app.title}</span>
                                        {
                                            app.quiz
                                            && <span
                                                className="text-indigo-50 text-xs font-semibold bg-indigo-500 rounded-full px-4 py-2"
                                            >QUIZ MODE</span>
                                        }
                                    </div>
                                    <span
                                        className="text-indigo-950 text-sm"
                                    >{app.group.name}</span>
                                </div>
                            </div>
                            <div
                                className="flex flex-col"
                            >
                                <span
                                    className="text-indigo-950 text-sm"
                                >{app.description}</span>
                                <span
                                    className="text-indigo-950 text-xs"
                                >Created on {new Date(app.createdAt).toDateString()} - {app.questions.length} Questions</span>
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-4 rounded-md shadow-md w-full p-8 bg-indigo-50"
                        >
                            <span
                                className="text-indigo-950 text-sm"
                            >Unfortunately, this form is not accepting responses at this time. Please check back at a later date, or reach out to the administrators if this is a mistake.</span>
                        </div>
                        <div
                            className="flex flex-row justify-end"
                        >
                            <Link
                                className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                                href={"/client"}
                            >Home</Link>
                        </div>
                    </div>
                )
                : (
                    <div
                        className="flex flex-col gap-4"
                    >
                        <div
                            className="flex flex-col gap-4 rounded-md shadow-md w-full p-8 bg-indigo-50"
                        >
                            <div
                                className="flex flex-row w-full gap-4"
                            >
                                <Logo
                                    groupId={app.group.groupId}
                                    className="w-12 h-12 rounded-md my-auto"
                                    onError={() => (
                                        <></>
                                    )}
                                />
                                <div
                                    className="flex flex-col my-auto"
                                >
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        <span
                                            className="text-indigo-950 text-lg font-semibold my-auto"
                                        >{app.title}</span>
                                        {
                                            app.quiz
                                            && <span
                                                className="text-indigo-50 text-xs font-semibold bg-indigo-500 rounded-full px-4 py-2"
                                            >QUIZ MODE</span>
                                        }
                                    </div>
                                    <span
                                        className="text-indigo-950 text-sm"
                                    >{app.group.name}</span>
                                </div>
                            </div>
                            <div
                                className="flex flex-col"
                            >
                                <span
                                    className="text-indigo-950 text-sm"
                                >{app.description}</span>
                                <span
                                    className="text-indigo-950 text-xs"
                                >Created on {new Date(app.createdAt).toDateString()} - {app.questions.length} Questions</span>
                            </div>
                        </div>
                        {
                            app.questions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className="flex flex-col rounded-md shadow-md w-full p-8 bg-indigo-50"
                                >
                                    <div
                                        className="flex flex-col w-full"
                                    >
                                        <span
                                            className="text-indigo-950 text-sm"
                                        >{q.title}</span>
                                        {
                                            q.description
                                            && <span
                                                className="text-indigo-950 text-xs mb-2"
                                            >{q.description}</span>
                                        }
                                    </div>
                                    {
                                        q.type === "TEXT"
                                            ? <TextArea
                                                value={
                                                    newApp.questions
                                                        ? newApp.questions!.findIndex(a => a.questionId === q.id) >= 0
                                                            ? newApp.questions[newApp.questions.findIndex(a => a.questionId === q.id)]
                                                                ? newApp.questions[newApp.questions.findIndex(a => a.questionId === q.id)].response
                                                                : ""
                                                            : ""
                                                        : ""
                                                }
                                                onChange={(event) => {
                                                    let value = event.target.value;
                                                    if (newApp.questions) {
                                                        let index = newApp.questions.findIndex(a => a.questionId === q.id);
                                                        let copy = [...newApp.questions];
                                                        console.log(index, copy);
                                                        if (index >= 0) {
                                                            copy[index].response = value;
                                                        } else {
                                                            copy.push({
                                                                questionId: q.id,
                                                                response: value
                                                            });
                                                        }

                                                        setNewApp({
                                                            questions: copy
                                                        })
                                                    } else {
                                                        setNewApp({
                                                            questions: [{
                                                                questionId: q.id,
                                                                response: value
                                                            }]
                                                        })
                                                    }
                                                }}
                                            />
                                            : q.type === "SELECT"
                                                ? <MultipleChoice
                                                    options={q.options}
                                                    value={
                                                        newApp.questions
                                                            ? newApp.questions.findIndex(a => a.questionId === q.id) >= 0
                                                                ? newApp.questions[newApp.questions.findIndex(a => a.questionId === q.id)]
                                                                    ? newApp.questions[newApp.questions.findIndex(a => a.questionId === q.id)].response
                                                                    : ""
                                                                : ""
                                                            : ""
                                                    }
                                                    onChange={(event) => {
                                                        if (newApp.questions) {
                                                            let index = newApp.questions.findIndex(a => a.questionId === q.id);
                                                            let copy = [...newApp.questions];
                                                            if (index >= 0) {
                                                                console.log(copy[index]);
                                                                copy[index].response = event;
                                                            } else {
                                                                console.log("here4");
                                                                copy.push({
                                                                    questionId: q.id,
                                                                    response: event
                                                                });
                                                            }

                                                            setNewApp({
                                                                questions: copy
                                                            })
                                                        } else {
                                                            setNewApp({
                                                                questions: [{
                                                                    questionId: q.id,
                                                                    response: event
                                                                }]
                                                            })
                                                        }
                                                    }}
                                                />
                                                : <></>
                                    }
                                </div>
                            ))
                        }
                        <div
                            className="flex flex-row justify-end"
                        >
                            <button
                                type="button"
                                className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                                onClick={submit}
                                disabled={submitting}
                            >Submit</button>
                        </div>
                    </div>
                )
            : (instance)
                ? (
                    <div
                        className="flex flex-col gap-4"
                    >
                        <div
                            className="flex flex-col gap-4 rounded-md shadow-md w-full p-8 bg-indigo-50"
                        >
                            <div
                                className="flex flex-row w-full gap-4"
                            >
                                <Logo
                                    groupId={instance.application.group.groupId}
                                    className="w-12 h-12 rounded-md my-auto"
                                    onError={() => (
                                        <></>
                                    )}
                                />
                                <div
                                    className="flex flex-col my-auto"
                                >
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        <span
                                            className="text-indigo-950 text-lg font-semibold my-auto"
                                        >{instance.application.title}</span>
                                        {
                                            instance.application.quiz
                                            && <span
                                                className="text-indigo-50 text-xs font-semibold bg-indigo-500 rounded-full px-4 py-2"
                                            >QUIZ MODE</span>
                                        }
                                    </div>
                                    <span
                                        className="text-indigo-950 text-sm"
                                    >{instance.application.group.name}</span>
                                </div>
                            </div>
                            <div
                                className="flex flex-col"
                            >
                                <span
                                    className="text-indigo-950 text-sm"
                                >{instance.application.description}</span>
                                <span
                                    className="text-indigo-950 text-xs"
                                >Submitted on {new Date(instance.createdAt).toDateString()}</span>
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-4 rounded-md shadow-md w-full p-8 bg-indigo-50"
                        >
                            <span
                                className="text-indigo-950 text-sm"
                            >{instance.application.submitText}</span>
                        </div>
                        <div
                            className="flex flex-row justify-end"
                        >
                            <Link
                                className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                                href={"/client"}
                            >Home</Link>
                        </div>
                    </div>
                )
                : (
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