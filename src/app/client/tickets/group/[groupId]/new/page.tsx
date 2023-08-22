"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";

import { useAuth } from "@/app/client/auth";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { TicketType } from "@prisma/client";
import { Modal } from "@/components/form/Modal";
import { Input, Select, TextArea } from "@/components/form/TextInput";
import { CreateTicket } from "@/components/client/modals/CreateTicket";

export default function Page() {
    const pathname = usePathname();
    const auth = useAuth();
    
    const [modal, setModal] = useState<boolean>(true);

    return (
        <div
            className="flex flex-col w-full h-full"
        >
            <CreateTicket
                isOpen={modal}
                onClose={() => {
                    setModal(false)
                }}
                groupId={pathname.split("/")[4]}
            />
        </div>
    )
}