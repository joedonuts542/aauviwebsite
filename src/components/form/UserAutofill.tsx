import type {
    User
} from "@prisma/client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { MoonLoader } from "react-spinners";
import { HiX } from "react-icons/hi";

export const UserAutofill = (props: {
    groupId: string,
    label?: string,
    helper?: string,
    type?: string,
    value?: string,
    defaultValue?: string,
    readOnly?: boolean,
    error?: string,
    className?: string,
    onChange?: (userId: string) => void;
}) => {
    const [search, setSearch] = useState<string>("");
    const [results, setResults] = useState<User[]>([]);

    const [user, setUser] = useState<User>();

    const searchCache = useSWR(
        () => {
            const params = new URLSearchParams({
                query: search,
                groupId: props.groupId
            })

            return (search && search.length > 3) ? `/api/search/users?${params.toString()}` : null
        }, fetch
    );

    useEffect(() => {
        if (
            !searchCache.isLoading
            && searchCache.data
        ) {
            const tryJson = async () => {
                try {
                    const body = await searchCache.data?.json();
                    if (body && body.users) {
                        setResults(body.users as User[]);
                    }
                } catch (error) {

                }
            }

            tryJson();
        } else if (searchCache.error) {
            toast.error("Error loading user data");
        }
    }, [searchCache]);

    useEffect(() => {
        if (search && search.length > 3) {
            searchCache.mutate();
        }
    }, [search]);

    useEffect(() => {
        if (props.defaultValue) {
            fetch(
                `/api/search/users/user?userId=${props.defaultValue}&groupId=${props.groupId}`
            ).then(async (response) => {
                try {
                    const body = await response.json();
                    if (response.status === 200 && body && body.users) {
                        if (Array.isArray(body.users) && body.users.length > 0) {
                            setUser(body.users[0] as User);
                        }
                    } else {
                        throw Error(body.error);
                    }
                } catch (error) {
                    toast.error(error!.toString());
                }
            }).catch((error) => {
                toast.error("Error loading user data");
            })
        }
    }, [props.defaultValue])

    return (
        <div
            className={`flex flex-col w-full gap-2 ${props.className}`}
        >
            {
                props.label
                && <span className="text-indigo-950 text-sm">
                    {props.label}
                </span>
            }
            <div className={`relative flex flex-row justify-between w-full rounded-md border-0 py-2 px-2 text-indigo-950 bg-inherit shadow-sm ring-1 ring-inset ring-indigo-200 placeholder:text-indigo-300 focus:ring-2 focus:ring-inset focus-within:ring-indigo-500 focus-within:ring-2 text-sm leading-6 ${props.error ? "ring-2 ring-inset ring-red-500" : ""}`}>
                {
                    user
                        ? <span
                            className="text text-sm my-auto font-semibold truncate"
                        >
                            {
                                (user.preferredUsername === user.nickname && user.nickname)
                                    ? `@${user.preferredUsername}`
                                    : `${user.nickname} (@${user.preferredUsername})`
                            }
                        </span>
                        : <input
                            type={props.type || "text"}
                            value={search}
                            readOnly={props.readOnly}
                            className={"ring-0 border-none hover:ring-0 hover:border-9 focus:ring-0 my-auto p-0 bg-inherit w-full"}
                            onChange={(event) => {
                                setSearch(event.target.value);
                            }}
                        />
                }
                <div
                    className="flex flex-col my-auto"
                >
                    {
                        searchCache.isLoading
                        && <MoonLoader
                            size={8}
                            className={"flex mx-auto my-auto"}
                            color={"#6366f1"}
                        />
                    }
                    {
                        user
                        && <HiX
                            size={8}
                            className={"flex mx-auto my-auto hover:text-red-500 transition duration-200"}
                            onClick={() => {
                                setUser(undefined)
                            }}
                        />
                    }
                </div>
                {
                    search.length > 0
                        ? <div
                            className="absolute flex flex-col w-full max-h-[256px] px-[-.5rem] ml-[-.5rem] top-[100%] overflow-y-auto bg-white rounded-md shadow-md"
                        >
                            {
                                search.length < 3
                                    ? <span
                                        className="p-4 text-indigo-950 text-xs w-full text-center"
                                    >Type 4 letters to search</span>
                                    : results.length < 1
                                        ? searchCache.isLoading
                                            ? <span
                                                className="p-4 text-indigo-950 text-xs w-full text-center"
                                            >Loading...</span>
                                            : <span
                                                className="p-4 text-indigo-950 text-xs w-full text-center"
                                            >No results</span>
                                        : <>
                                            {
                                                results.map(r => (
                                                    <div
                                                        key={r.id}
                                                        className="p-4 w-full text-indigo-950 text-xs first-of-type:rounded-t-md last-of-type:rounded-b-md hover:bg-indigo-500 hover:text-indigo-50 cursor-pointer"
                                                        onClick={() => {
                                                            setUser(r);
                                                            setSearch("");
                                                            setResults([]);
                                                            if (props.onChange) { props.onChange(r.id) }
                                                        }}
                                                    >
                                                        <span>{r.name}</span>
                                                    </div>
                                                ))
                                            }
                                        </>
                            }
                        </div>
                        : undefined
                }
            </div>
            {
                (props.helper || props.error)
                && <span className={`text-xs mt-[0.25rem] ${props.error ? "text-red-500" : "text-indigo-950"}`}>
                    {props.error ? props.error : props.helper}
                </span>
            }
        </div>
    )
}