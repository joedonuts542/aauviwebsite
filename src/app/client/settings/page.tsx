"use client";

import { useEffect, useState } from "react";

import { useAuth } from "../auth";
import { Avatar } from "@/components/content/Avatar";

import { User } from "@prisma/client";
import { Input } from "@/components/form/TextInput";
import { MoonLoader } from "react-spinners";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
    const auth = useAuth();

    const [editableUser, setEditableUser] = useState<User>();
    useEffect(() => {
        if (auth.user) {
            setEditableUser(auth.user);
        }
    }, [auth]);

    const [saving, setSaving] = useState<boolean>(false);
    const save = async () => {
        if (!saving && editableUser) {
            setSaving(true);
            try {
                const response = await fetch(
                    `/api/settings`,
                    {
                        body: JSON.stringify({
                            email: editableUser.email
                        }),
                        method: "POST"
                    }
                );

                const body = await response.json();
                if (body.data) {
                    toast.success(body.data);
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`${error}`)
            }
        }
    }

    return (
        auth.user
    ) ? (
        <div
            className="flex flex-col gap-12 w-full"
        >
            <div
                className="flex flex-row justify-between w-full bg-indigo-50 shadow-md rounded-md p-8"
            >
                <div
                    className="flex flex-row my-auto gap-8"
                >
                    <Avatar
                        className="w-12 h-12 rounded-full my-auto"
                        userId={auth.user!.robloxId}
                        onError={() => (
                            <></>
                        )}
                    />
                    <div
                        className="flex flex-col my-auto gap-1"
                    >
                        <span
                            className="text-indigo-950 text-sm font-semibold my-auto"
                        >{auth.user?.name} (@{auth.user?.preferredUsername})</span>
                        <div
                            className="flex flex-row gap-2 w-full"
                        >
                            {
                                auth.user?.beta
                                && <span
                                    className="text-indigo-50 text-xs font-semibold my-auto px-2 py-1 rounded-full bg-indigo-500"
                                >BETA</span>
                            }
                            {
                                auth.user?.beta
                                && <span
                                    className="text-indigo-50 text-xs font-semibold my-auto px-2 py-1 rounded-full bg-indigo-500"
                                >VERIFIED</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col gap-4 w-full"
            >
                <div
                    className="flex flex-col gap-4 w-full bg-indigo-50 rounded-md shadow-md p-8"
                >
                    {
                        editableUser
                            ? <>
                                <span
                                    className="text-indigo-950 text-lg font-semibold"
                                >User Settings</span>
                                <Input
                                    label={"Email"}
                                    type={"email"}
                                    value={editableUser.email || ""}
                                    helper={"Emails are not required, but may be used for additional communication"}
                                    onChange={(event) => {
                                        setEditableUser({
                                            ...editableUser,
                                            email: event.target.value
                                        })
                                    }}
                                />
                                <div
                                    className="flex flex-row w-full gap-2 col-span-2 justify-end"
                                >
                                    <button
                                        className="text-indigo-50 text-sm font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                        disabled={saving}
                                        onClick={() => {
                                            save();
                                        }}
                                    >Save</button>
                                </div>
                            </>
                            : <div
                                className="flex flex-row w-full"
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