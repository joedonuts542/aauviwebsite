import useSWR from "swr";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useGroup } from "@/app/client/groups/group";
import { MoonLoader } from "react-spinners";

import { ApplicationInstance, GroupApplication } from "@prisma/client";
import Image from "next/image";

export const GroupApps = () => {
    const pathname = usePathname();
    const group = useGroup();

    const [apps, setApps] = useState<(GroupApplication & { instances: ApplicationInstance[] })[]>([]);
    const appsCache = useSWR(
        `/api/groups/${group.group?.id}/apps`,
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
                    if (body.apps) {
                        setApps(body.apps);
                    }
                } catch (error) {

                }
            };

            tryJson();
        }
    }, [appsCache]);

    return (!appsCache.isLoading && !appsCache.isValidating) ? (
        <div
            className="flex flex-col gap-4"
        >
            {
                apps.length < 10
                && <div
                    className="flex flex-row w-full justify-end"
                >
                    <Link
                        className="text-indigo-50 bg-indigo-500 rounded-full shadow-sm px-4 py-2 text-sm font-semibold cursor-pointer hover:shadow-md hover:bg-indigo-600 transition duration-200"
                        href={`${pathname}/new`}
                    > + New Application </Link>
                </div>
            }
            {
                apps.length > 0
                    ? <div
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
                    >
                        {
                            apps.map(a => (
                                <Link
                                    key={a.id}
                                    href={`${pathname}/${a.id}`}
                                    className="flex flex-col p-8 bg-indigo-50 rounded-md shadow-md hover:shadow-lg transition duration-200 cursor-pointer w-full"
                                >
                                    <div
                                        className="flex flex-row gap-2"
                                    >
                                        <span
                                            className="text-indigo-950 text-md font-semibold truncate my-auto"
                                        >{a.title}</span>
                                        {
                                            a.isActive
                                                ? <span
                                                    className="flex flex-row text-indigo-50 bg-green-500 rounded-full px-2 py-1 text-xs font-semibold"
                                                >ACTIVE</span>
                                                : <span
                                                    className="flex flex-row text-indigo-50 bg-red-500 rounded-full px-2 py-1 text-xs font-semibold my-auto"
                                                >INACTIVE</span>
                                        }
                                    </div>
                                    <span
                                        className="text-indigo-950 text-xs mt-4"
                                    >{a.description}</span>
                                    <span
                                        className="text-indigo-950 text-xs mt-2"
                                    >{a.instances.length} pending response{a.instances.length === 1 ? "" : "s"}</span>
                                </Link>
                            ))
                        }
                    </div>
                    : <div
                        className="flex flex-col w-full py-12"
                    >
                        <Image
                            width={400}
                            height={400}
                            src={"/static/NoApps.svg"}
                            alt={"No Apps"}
                            className="mx-auto"
                        />
                        <span
                            className="text-indigo-950 text-md font-semibold mx-auto mt-4"
                        >No Applications</span>
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