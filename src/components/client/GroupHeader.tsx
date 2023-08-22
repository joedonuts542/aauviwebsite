import { GroupDetails } from "@/util/db/group"
import { User } from "@prisma/client"
import { useState } from "react";
import { HiDotsVertical, HiChatAlt, HiTrash, HiTicket } from "react-icons/hi";
import { Logo } from "../content/Logo";
import { Dropdown } from "../form/Dropdown";
import { CreateReport } from "./modals/CreateReport";
import { CreateTicket } from "./modals/CreateTicket";

export const GroupHeader = (props: {
    group: GroupDetails,
    owner: User
}) => {
    const [menu, setMenu] = useState<boolean>(false);
    const [reportModal, setReportModal] = useState<boolean>(false);
    const [ticketModal, setTicketModal] = useState<boolean>(false);

    return (
        <div
            className="flex flex-row justify-between w-full bg-indigo-50 shadow-md rounded-md p-8"
        >
            <div
                className="flex flex-row my-auto gap-8"
            >
                <Logo
                    className="w-16 h-16 rounded-lg my-auto"
                    groupId={props.group.groupId}
                    onError={() => (
                        <></>
                    )}
                />
                <div
                    className="flex flex-col my-auto"
                >
                    <span
                        className="text-indigo-950 text-lg font-bold"
                    >{props.group.name}</span>
                    <span
                        className="text-indigo-950 text-sm"
                    >Created by {props.owner.name} on {new Date(props.group.createdAt).toLocaleDateString()}</span>
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
                                setReportModal(true);
                                onClose();
                            }
                        },
                        {
                            key: "ticket",
                            display: (
                                props.group.nodeHelpdesk
                                    ? <div
                                        className="flex flex-row gap-2"
                                    >
                                        <HiTicket className="my-auto" />
                                        <span>New Ticket</span>
                                    </div>
                                    : undefined
                            ),
                            onClick: (onClose) => {
                                setTicketModal(true);
                                onClose();
                            }
                        }
                    ]}
                />
            </div>
            <CreateReport
                isOpen={reportModal}
                onClose={() => {
                    setReportModal(false)
                }}
                type={"GROUP"}
                targetId={props.group.id}
            />
            <CreateTicket
                isOpen={ticketModal}
                onClose={() => {
                    setTicketModal(false);
                }}
                groupId={props.group.id}
            />
        </div>
    )
}