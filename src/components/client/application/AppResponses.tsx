import useSWR from "swr";
import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";

import { useGroup } from "@/app/client/groups/group";
import { MoonLoader } from "react-spinners";

import { ApplicationInstance, ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { Avatar } from "@/components/content/Avatar";
import Image from "next/image";

export const AppResponses = (props: {
    status: ApplicationStatus
}) => {
    const pathname = usePathname();
    const { appId } = useParams();
    const group = useGroup();

    const [responses, setResponses] = useState<ApplicationInstance[]>([]);
    const appsCache = useSWR(
        `/api/groups/${group.group?.id}/apps/${appId}/responses?status=${props.status}`,
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
                    if (body.responses) {
                        setResponses(body.responses);
                    }
                } catch (error) {

                }
            };

            tryJson();
        }
    }, [appsCache]);

    return (!appsCache.isLoading && !appsCache.isValidating) ? (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
            {
                responses.length > 0
                    ? responses.map(r => (
                        <Link
                            key={r.id}
                            href={`${pathname}/${r.id}`}
                            className="flex flex-col h-full w-full gap-2 p-4 rounded-md shadow-md bg-indigo-50 hover:shadow-lg transition duration-200 cursor-pointer"
                        >
                            <div
                                className="flex flex-row gap-4 w-full"
                            >
                                {
                                    (r.userId && r.userName)
                                        ? <>
                                            <Avatar
                                                userId={r.userId}
                                                onError={() => (
                                                    <></>
                                                )}
                                                className="w-8 h-8 my-auto rounded-full"
                                            />
                                            <span
                                                className="text-indigo-950 text-md font-semibold truncate"
                                            >{r.userName}</span>
                                        </>
                                        : <span
                                            className="text-indigo-950 text-md font-semibold truncate"
                                        >Anonymous Response</span>
                                }
                            </div>
                            <span
                                className="text-indigo-950 text-xs"
                            >Submitted on {new Date(r.createdAt).toDateString()}</span>
                        </Link>
                    ))
                    : <div
                        className="flex flex-col py-16 bg-indigo-50 rounded-md shadow-md p-8 w-full col-span-5"
                    >
                        <Image
                            width={400}
                            height={400}
                            src={"/static/NoResponses.svg"}
                            alt={"No Responses"}
                            className="mx-auto"
                        />
                        <span
                            className="text-indigo-950 text-lg font-semibold mt-8 mx-auto"
                        >No Responses</span>
                    </div>
            }
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