import useSWR from "swr";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { useGroup } from "@/app/client/groups/group";
import { MoonLoader } from "react-spinners";

import { GroupApplication } from "@prisma/client";
import { Input, TextArea } from "@/components/form/TextInput";
import { Toggle } from "@/components/form/Toggle";
import { toast } from "react-hot-toast";

export const AppDetails = () => {
    const { appId } = useParams();
    const group = useGroup();

    const [app, setApp] = useState<(GroupApplication)>();
    const appsCache = useSWR(
        `/api/groups/${group.group?.id}/apps/${appId}`,
        fetch
    );

    useEffect(() => {
        if (
            !appsCache.isLoading
            && appsCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await appsCache.data!.json();
                    if (body.app) {
                        setApp(body.app);
                    }
                } catch (error) {

                }
            };

            tryJson();
        }
    }, [appsCache]);

    const [saving, setSaving] = useState<boolean>(false);
    const save = async () => {
        if (!saving && group.group) {
            setSaving(true);
            const response = await fetch(
                `/api/groups/${group.group.id}/apps/${appId}`,
                {
                    method: "POST",
                    body: JSON.stringify(app)
                }
            );

            try {
                const body = await response.json();
                if (body) {
                    if (body.data) {
                        toast.success(body.data)
                    } else {
                        throw Error(body.error);
                    }
                } else {
                    throw Error("Cannot run a new archive.")
                }
            } catch (error) {
                toast.error(error!.toString())
            } finally {
                setSaving(false);
            }
        }
    }

    return (app) ? (
        <div
            className="flex flex-col gap-4"
        >
            <div
                className="flex flex-col lg:flex-row gap-4 w-full"
            >
                <div
                    className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 w-full h-full gap-4"
                >
                    <Input
                        label={"Title"}
                        value={app.title}
                        onChange={(event) => {
                            setApp({
                                ...app,
                                title: event.target.value
                            })
                        }}
                    />
                    <TextArea
                        rows={4}
                        label={"Description"}
                        value={app.description}
                        onChange={(event) => {
                            if (event.target.value.length <= 300) {
                                setApp({
                                    ...app,
                                    description: event.target.value
                                })
                            }
                        }}
                        helper={`${app.description.length}/300`}
                    />
                </div>
                <div
                    className="flex flex-col gap-4"
                >
                    <div
                        className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 w-full lg:w-fit gap-4"
                    >
                        <div
                            className="flex flex-row justify-between w-full gap-4"
                        >
                            <span
                                className="text-indigo-950 text-sm"
                            >Enable Responses</span>
                            <Toggle
                                checked={app.isActive}
                                onChange={(event) => {
                                    setApp({
                                        ...app,
                                        isActive: event
                                    })
                                }}
                            />
                        </div>
                        <div
                            className="flex flex-row justify-between w-full gap-4"
                        >
                            <span
                                className="text-indigo-950 text-sm"
                            >Quiz Mode</span>
                            <Toggle
                                disabled={true}
                                checked={app.quiz}
                                onChange={(event) => {
                                    setApp({
                                        ...app,
                                        quiz: event
                                    })
                                }}
                            />
                        </div>
                        <div
                            className="flex flex-col w-full p-4 rounded-md bg-indigo-100 cursor-pointer overflow-x-auto"
                        >
                            <span
                                className="text-indigo-950 text-xs"
                                onClick={() => {
                                    if (navigator) {
                                        toast.success("Copied to clipboard!")
                                        navigator.clipboard.writeText(`https://theneuro.io/client/apps/${app.id}`);
                                    }
                                }}
                            >{`https://theneuro.io/client/apps/${app.id}`}</span>
                        </div>
                    </div>
                    <div
                        className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 gap-4 w-full h-full"
                    >
                        <span
                            className="text-indigo-950 text-md font-semibold my-auto"
                        >Created on {new Date(app.createdAt).toDateString()}</span>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8 w-full gap-4"
            >
                <TextArea
                    label={"Submit Message"}
                    value={app.submitText}
                    onChange={(event) => {
                        if (event.target.value.length <= 100) {
                            setApp({
                                ...app,
                                submitText: event.target.value
                            })
                        }
                    }}
                    helper={`${app.submitText.length}/100`}
                />
                <div
                    className="flex flex-row gap-4 w-full justify-end"
                >
                    <button
                        type="button"
                        className="flex flex-col px-4 py-2 text-sm border-0 ring-0 outline-0 rounded-md bg-indigo-500 text-indigo-50 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-default transition duration-200"
                        onClick={save}
                        disabled={saving}
                    >Save</button>
                </div>
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