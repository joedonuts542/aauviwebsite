import { Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

export const Modal = (props: {
    isOpen: boolean
    onClose: () => void;
    title: React.ReactNode | string;
    body: React.ReactNode | string;
    footer: React.ReactNode;
}) => (
    <Transition.Root show={props.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={props.onClose}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <Dialog.Panel 
                            className="relative transform overflow-hidden rounded-lg bg-indigo-50 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg text-left"
                        >
                            <div className="flex flex-col px-4 pb-4 pt-5 sm:p-6 sm:pb-4 gap-4">
                                {
                                    typeof props.title === "string"
                                        ? <span
                                            className="text-indigo-950 text-lg font-semibold"
                                        >{props.title}</span>
                                        : <>{props.title}</>
                                }
                                {
                                    typeof props.body === "string"
                                        ? <span
                                            className="text-indigo-950 text-sm"
                                        >{props.body}</span>
                                        : <>{props.body}</>
                                }
                            </div>
                            <div className="bg-indigo-100 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                                {props.footer}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </Dialog>
    </Transition.Root>
)