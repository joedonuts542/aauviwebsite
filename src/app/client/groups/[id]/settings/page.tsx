"use client";

import useSWR from "swr";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { useAuth } from "../../../auth";
import { useGroup } from "../../group";

import { MoonLoader } from "react-spinners";
import { GroupHeader } from "@/components/client/GroupHeader";
import { toast } from "react-hot-toast";
import { Input, Select } from "@/components/form/TextInput";
import { DateTime } from "luxon";
import { HiDownload, HiX } from "react-icons/hi";
import { GroupPlace, GroupTimes } from "@prisma/client";

export default function GroupPage() {
    const group = useGroup();
    const path = usePathname();
    const auth = useAuth();

    const [groupPlaces, setGroupPlaces] = useState<{ id: number, name: string }[]>([]);
    const [places, setPlaces] = useState<GroupPlace[]>([]);
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

                        if (group.group && group.group.trackingRank) {
                            setTrackingRank(group.group.trackingRank);
                        }
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [roleCache]);

    const gamesCache = useSWR(
        () => {
            return group.group ? `/api/proxy/groups/games/${group.group.groupId}` : null
        },
        fetch,
        {
            revalidateOnFocus: false
        }
    );

    useEffect(() => {
        if (!gamesCache.isLoading
            && gamesCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await gamesCache.data?.json();
                    if (body.games) {
                        setGroupPlaces(body.games);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [gamesCache]);

    const placesCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/places` : null
        },
        fetch
    );

    useEffect(() => {
        if (!placesCache.isLoading
            && placesCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await placesCache.data?.json();
                    if (body.places) {
                        setPlaces(body.places);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [placesCache]);

    const [token, setToken] = useState<string>("");
    const [generating, setGenerating] = useState<boolean>(false);
    const generate = async () => {
        if (
            !generating
            && group.group
            && group.user
            && group.user.role.level >= 1000
        ) {
            setGenerating(true);
            const response = await fetch(
                `/api/groups/${group.group.id}/token`,
                {
                    method: "POST"
                }
            );

            try {
                const body = await response.json();
                if (body && body.token) {
                    setToken(body.token);
                } else if (body.error) {
                    toast.error(body.error);
                }
            } catch (error) {
                toast.error(`Failed to generate token: ${error}`)
            } finally {
                setGenerating(false);
            }
        }
    }

    const [saving, setSaving] = useState<boolean>(false);
    const [trackingRank, setTrackingRank] = useState<number>(0);
    const save = async (sync?: true) => {
        if (
            !saving
            && group.group
            && group.user
        ) {
            setSaving(true);

            if (sync) {
                toast.loading("Your group is being synced... this may take a few seconds.");
            }

            const response = await fetch(
                `/api/groups/${group.group.id}`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        sync,
                        trackingRank
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

    const [placeId, setPlaceId] = useState<string>("");
    const add = async () => {
        if (
            group.group
            && group.user
        ) {
            const response = await fetch(
                `/api/groups/${group.group.id}/places`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        placeId
                    })
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    placesCache.mutate();
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
                `/api/groups/${group.group.id}/places/${id}`,
                {
                    method: "DELETE"
                }
            );

            try {
                const body = await response.json();
                if (body && body.data) {
                    toast.success(body.data);
                    placesCache.mutate()
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
        && group.user.role.admin
    ) ? (
        <div
            className="flex flex-col gap-12"
        >
            <GroupHeader
                group={group.group}
                owner={group.owner}
            />
            <div
                className={"flex flex-col gap-4 w-full"}
            >
                {
                    group.user.role.level === 1000
                    && <div
                        className="flex flex-col bg-indigo-50 rounded-md shadow-md p-8"
                    >
                        <div
                            className="flex flex-row justify-between mb-2"
                        >
                            <span
                                className="text-indigo-950 text-lg font-semibold my-auto"
                            >Access Token</span>
                            <button
                                className="text-indigo-50 text-sm font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                                disabled={generating}
                                onClick={generate}
                            >Generate</button>
                        </div>
                        <span
                            className="text-indigo-950 text-sm"
                        >Access tokens are used to interact with your Roblox group. They are required to track employee time, monitor game activity, and rank players in-game. Due to security reasons, your token can only be viewed once after generation.</span>
                        <div
                            className="flex flex-row gap-4"
                        >
                            <span
                                className="mt-4 w-fit px-4 py-2 rounded-md bg-indigo-100 text-indigo-950 cursor-pointer"
                                onClick={() => {
                                    navigator.clipboard.writeText(group.group!.id);
                                    toast.success("Group ID copied to clipboard!");
                                }}
                            >
                                Group ID: {group.group.id}
                            </span>
                            {
                                token
                                && <span
                                    className="mt-4 w-fit px-4 py-2 rounded-md bg-indigo-100 text-indigo-950 cursor-pointer"
                                    onClick={() => {
                                        navigator.clipboard.writeText(token);
                                        toast.success("Copied to clipboard!");
                                    }}
                                >
                                    •••••••••••••••••••••••••••••
                                </span>
                            }
                        </div>
                    </div>
                }
                <div
                    className="grid grid-cols-2 w-full bg-indigo-50 rounded-md shadow-md p-8 gap-4"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold col-span-2"
                    >Users</span>
                    <Select
                        options={availableRoles.map(r => ({
                            display: r.name,
                            value: r.rank.toString()
                        }))}
                        label={"Minimum Rank"}
                        value={trackingRank.toString()}
                        onChange={(event) => {
                            setTrackingRank(Number(event.target.value))
                        }}
                        className={"col-span-2"}
                    />
                    <span
                        className={"text-indigo-950 text-sm col-span-2"}
                    >Syncs can only be run once an hour; they will add new employees to your workspace and remove old ones. <b>Your last sync was run on {DateTime.fromJSDate(new Date(group.group.syncedAt)).toFormat("ffff")}</b></span>
                    <div
                        className="flex flex-row w-full gap-2 col-span-2 justify-end"
                    >
                        <button
                            className="text-indigo-50 text-sm font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                            disabled={(
                                saving
                                || (Date.now() - new Date(group.group.syncedAt).getTime()) < (1000 * 60 * 60)
                            )}
                            onClick={() => {
                                save(true);
                            }}
                        >Sync Now</button>
                        <button
                            className="text-indigo-50 text-sm font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                            disabled={saving}
                            onClick={() => {
                                save();
                            }}
                        >Save</button>
                    </div>
                </div>
                <div
                    className="flex flex-col w-full bg-indigo-50 rounded-md shadow-md p-8"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold col-span-2"
                    >Places</span>
                    <div
                            className="col-span-2 flex flex-col w-full gap-2"
                        >
                            <div
                                className="flex flex-row w-full gap-4"
                            >
                                <Select
                                    options={groupPlaces.filter(g => places.findIndex(p => Number(p.placeId) === g.id) < 0).map(p => ({
                                        display: p.name,
                                        value: p.id.toString()
                                    }))}
                                    label={"Group Games"}
                                    value={placeId}
                                    onChange={(event) => {
                                        setPlaceId(event.target.value)
                                    }}
                                    helper={"Places that will be able to access your neuro group"}
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
                                    places.map(p => (
                                        <div
                                            key={p.id}
                                            className="px-2 py-1 w-fit flex flex-row gap-2 bg-indigo-500 rounded-full"
                                        >
                                            <span
                                                className="text-indigo-50 text-xs font-semibold my-auto"
                                            >{p.placeName}</span>
                                            <HiX
                                                className="text-indigo-50 my-auto cursor-pointer"
                                                onClick={() => {
                                                    remove(p.id);
                                                }}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                </div>
                <div
                    className="flex flex-row justify-between w-full bg-indigo-50 rounded-md shadow-md p-8"
                >
                    <span
                        className="text-indigo-950 text-lg font-semibold my-auto"
                    >Roblox Time Tracker</span>
                    <a
                        className="text-indigo-50 text-sm flex flex-row gap-2 font-semibold my-auto px-4 py-2 bg-indigo-500 rounded-full shadow-md hover:bg-indigo-600 disabled:indigo-700 transition duration-200"
                        href={`/assets/Loader.rbxm`}
                    >
                        <HiDownload
                            className="my-auto"
                        />
                        <span>Download</span>
                    </a>
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