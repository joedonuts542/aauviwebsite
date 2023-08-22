import { useEffect, useState } from "react";
import { HiDotsVertical, HiChatAlt, HiTrash } from "react-icons/hi";
import { Dropdown } from "../form/Dropdown";
import { Avatar } from "../content/Avatar";

import { UserScope } from "@/app/client/groups/group";
import { Group, User } from "@prisma/client";
import { toast } from "react-hot-toast";

export const ProfileHeader = (props: {
    user: UserScope;
    auth: User;
    group?: Group;
    userId?: string;
}) => {
    const [user, setUser] = useState<User>();
    const [userScope, setUserScope] = useState<UserScope["role"]>();

    const [menu, setMenu] = useState<boolean>(false);

    useEffect(() => {
        if (props.userId && props.group) {
            fetch(
                `/api/groups/${props.group.id}/profile/${props.userId}`
            ).then(async (response) => {
                const body = await response.json();
                if (body.user && body.role) {
                    console.log(body);
                    setUser(body.user);
                    setUserScope(body.role);
                } else {
                    toast.error(`${body.error}`)
                }
            }).catch((error) => {
                toast.error(`${error}`)
            });
        } else {
            setUser(props.auth);
            setUserScope(props.user.role);
        }
    }, [props])

    return (user && userScope) ? (
        <div
            className="flex flex-row justify-between w-full bg-indigo-50 shadow-md rounded-md p-8"
        >
            <div
                className="flex flex-row my-auto gap-8"
            >
                <Avatar
                    className="w-16 h-16 rounded-lg my-auto"
                    userId={user.robloxId}
                    onError={() => (
                        <></>
                    )}
                />
                <div
                    className="flex flex-col my-auto"
                >
                    <span
                        className="text-indigo-950 text-lg font-bold"
                    >{user.name}</span>
                    <span
                        className="text-indigo-950 text-sm"
                    >{userScope.name}</span>
                </div>
            </div>
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
                            key: "report",
                            display: (
                                <div
                                    className="flex flex-row gap-2"
                                >
                                    <HiChatAlt className="my-auto" />
                                    <span>Report</span>
                                </div>
                            ),
                            onClick: (onClose) => {

                            }
                        },
                        {
                            key: "leave",
                            display: (
                                <div
                                    className="flex flex-row gap-2"
                                >
                                    <HiTrash className="my-auto" />
                                    <span>Leave</span>
                                </div>
                            ),
                            onClick: (onClose) => {

                            }
                        }
                    ]}
                />
            </div>
        </div>
    ) : (
        <div
            className="flex flex-row justify-between w-full bg-indigo-50 shadow-md rounded-md p-8"
        >
            <div
                className="flex flex-row my-auto gap-8"
            >
                <div
                    className="bg-indigo-100 rounded-full w-16 h-16"
                />
            </div>
        </div>
    )
}