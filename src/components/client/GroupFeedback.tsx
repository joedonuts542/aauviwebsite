import useSWR from "swr";
import { useState, useEffect } from "react";

import { useAuth } from "@/app/client/auth";
import { useGroup } from "@/app/client/groups/group";
import { GroupFeedback as Feedback, GroupPlace } from "@prisma/client";
import { HiCheckCircle, HiDotsVertical, HiEmojiHappy, HiEmojiSad, HiFlag, HiStar } from "react-icons/hi";
import { Avatar } from "../content/Avatar";
import { Dropdown } from "../form/Dropdown";
import toast from "react-hot-toast";
import { Icon } from "../content/Icon";
import Image from "next/image";

type FeedbackDetails = Feedback & {
    userName: string,
    displayName: string
};

export const GroupFeedback = () => {
    const group = useGroup();
    const auth = useAuth();

    const [menu, setMenu] = useState<string>();
    const [places, setPlaces] = useState<GroupPlace[]>([]);
    const [feedback, setFeedback] = useState<FeedbackDetails[]>([]);
    const feedbackCache = useSWR(
        () => {
            return group.group ? `/api/groups/${group.group.id}/feedback` : null
        },
        fetch
    );

    useEffect(() => {
        if (!feedbackCache.isLoading
            && feedbackCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await feedbackCache.data?.json();
                    if (body.feedback) {
                        setFeedback(body.feedback);
                    }
                } catch (error) {

                }
            }

            tryJson();
        }
    }, [feedbackCache]);

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

    const [deleting, setDeleting] = useState<boolean>(false);
    const deletePost = async (
        feedbackId: string,
        resolve?: boolean
    ) => {
        if (!deleting && group.group) {
            setDeleting(true);
            try {
                const response = await fetch(
                    `/api/groups/${group.group.id}/feedback/${feedbackId}${resolve ? `?resolve=true` : ``}`,
                    {
                        method: "DELETE",
                    }
                );

                const body = await response.json();
                if (response.status === 200) {
                    setDeleting(false);
                    if (body.data) {
                        toast.success(resolve ? `This feedback post has been resolved.` : `This feedback post has been marked as resolved.`);
                        feedbackCache.mutate()
                    } else {
                        throw Error("Unexpected error while modifying feedback post, please try again.");
                    }
                } else {
                    setDeleting(false);
                    throw Error(body.error);
                }
            } catch (error) {
                setDeleting(false)
                toast.error((error as Error).message);
            }
        }
    }

    return (
        <div
            className="flex flex-col md:flex-row gap-4"
        >
            {
                places.length > 0
                && <div
                    className="flex flex-col gap-4 w-full md:w-96"
                >
                    {
                        places.length > 0
                            ? places.map(p => (
                                <div
                                    key={p.id}
                                    className="flex flex-gap w-full p-8 bg-indigo-50 rounded-md shadow-md gap-4"
                                >
                                    <div
                                        className="flex flex-col my-auto"
                                    >
                                        <Icon
                                            gameId={p.placeId}
                                            onError={
                                                () => (
                                                    <div
                                                        className="w-12 h-12 rounded-md bg-indigo-100"
                                                    />
                                                )
                                            }
                                            className="w-12 h-12 rounded-md bg-indigo-100"
                                        />
                                    </div>
                                    <div
                                        className="flex flex-col my-auto"
                                    >
                                        <span
                                            className="text-indigo-950 text-md font-semibold"
                                        >{p.placeName}</span>
                                        <div
                                            className="flex flex-row gap-2"
                                        >
                                            {
                                                p.averageRating > 4
                                                    ? <HiEmojiHappy
                                                        className="my-auto text-green-500"
                                                    />
                                                    : p.averageRating > 2.5
                                                        ? <HiEmojiSad
                                                            className="my-auto text-orange-500"
                                                        />
                                                        : <HiEmojiSad
                                                            className="my-auto text-red-500"
                                                        />
                                            }
                                            <span
                                                className="text-indigo-950 text-xs my-auto"
                                            >{p.averageRating.toFixed(1)}/5.0 stars</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                            : undefined
                    }
                </div>
            }
            <div
                className="flex flex-col gap-4 w-full"
            >
                {
                    feedback.length > 0
                        ? feedback.map(f => (
                            <div
                                key={f.id}
                                className="flex flex-gap w-full p-8 bg-indigo-50 rounded-md shadow-md gap-4"
                            >
                                <div
                                    className="flex flex-row w-full justify-between p-4"
                                >
                                    <div
                                        className="flex flex-row gap-4"
                                    >
                                        <Avatar
                                            userId={f.createdBy}
                                            className="w-12 h-12 my-auto rounded-full"
                                            onError={() => (
                                                <></>
                                            )}
                                        />
                                        <div
                                            className="flex flex-col my-auto"
                                        >
                                            <div
                                                className="flex flex-row gap-2"
                                            >
                                                <span
                                                    className="text-indigo-950 text-lg font-semibold"
                                                >{(f.displayName && f.displayName !== f.userName) ? `${f.displayName} (@${f.userName})` : f.userName}</span>
                                                {
                                                    (Date.now() < new Date(f.createdAt).getTime() + (1000 * 60 * 60))
                                                    && <span
                                                        className="px-2 py-1 text-indigo-50 text-xs bg-indigo-500 rounded-full font-semibold my-auto"
                                                    >NEW</span>
                                                }
                                            </div>
                                            <span
                                                className="text-indigo-950 text-xs"
                                            >for <b>{places.findIndex(p => p.id === f.placeId) >= 0 ? places[places.findIndex(p => p.id === f.placeId)].placeName : "Unknown Place"}</b></span>
                                        </div>
                                    </div>
                                    <div
                                        className="relative flex flex-col my-auto rounded-full p-2 bg-interit text-indigo-500 hover:bg-indigo-500 hover:text-indigo-50 transition duration-200 cursor-pointer"
                                    >
                                        <HiDotsVertical
                                            className="my-auto mx-auto"
                                            onClick={() => {
                                                setMenu(menu === f.id ? undefined : f.id);
                                            }}
                                        />
                                        <Dropdown
                                            isOpen={menu === f.id}
                                            onClose={() => {
                                                setMenu(undefined);
                                            }}
                                            options={[
                                                {
                                                    key: "spam",
                                                    display: (
                                                        <div
                                                            className="flex flex-row gap-2"
                                                        >
                                                            <HiFlag className="my-auto" />
                                                            <span>Mark as Spam</span>
                                                        </div>
                                                    ),
                                                    onClick: (onClose) => {
                                                        deletePost(f.id);
                                                        onClose();
                                                    }
                                                },
                                                {
                                                    key: "resolve",
                                                    display: (
                                                        <div
                                                            className="flex flex-row gap-2"
                                                        >
                                                            <HiCheckCircle className="my-auto" />
                                                            <span>Resolve</span>
                                                        </div>
                                                    ),
                                                    onClick: (onClose) => {
                                                        deletePost(f.id, true)
                                                        onClose();
                                                    }
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                                <div
                                    className="flex flex-col p-4"
                                >
                                    <div
                                        className="flex flex-row gap-2 mb-2"
                                    >
                                        {
                                            f.rating > 4
                                                ? <HiEmojiHappy
                                                    className="my-auto text-green-500"
                                                />
                                                : f.rating > 2.5
                                                    ? <HiEmojiSad
                                                        className="my-auto text-orange-500"
                                                    />
                                                    : <HiEmojiSad
                                                        className="my-auto text-red-500"
                                                    />
                                        }
                                        <span
                                            className="text-indigo-950 text-xs my-auto"
                                        >{f.rating}/5.0 stars</span>
                                    </div>
                                    <span
                                        className="text-indigo-950 text-sm"
                                    >{f.description}</span>
                                    <span
                                        className="text-indigo-900 text-xs mt-2"
                                    >{new Date(f.createdAt).toDateString()}</span>
                                </div>
                            </div>
                        ))
                        : <div
                            className="flex flex-col gap-4 p-24 w-full bg-indigo-50 rounded-md shadow-md"
                        >
                            <Image
                                width={250}
                                height={250}
                                className="mx-auto"
                                src={"/static/Feedback.svg"}
                                alt={"No Feedback"}
                            />
                            <span
                                className="text-indigo-950 text-sm mx-auto"
                            >No Active Feedback</span>
                        </div>
                }
            </div>
        </div>
    )
}