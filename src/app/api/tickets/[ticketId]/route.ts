import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            ticketId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const ticketId = params.ticketId;
        if (auth) {
            const ticket = await prisma.groupTicket.findFirstOrThrow({
                where: {
                    id: ticketId,
                    OR: [
                        {
                            createdBy: auth.id
                        },
                        {
                            responses: {
                                some: {
                                    createdBy: auth.id
                                }
                            }
                        },
                        {
                            group: {
                                users: {
                                    some: {
                                        userId: auth.id,
                                        role: {
                                            OR: [
                                                {
                                                    developer: true,
                                                },
                                                {
                                                    admin: true
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    responses: {
                        include: {
                            user: true
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                    type: true,
                    group: {
                        select: {
                            id: true,
                            groupId: true,
                            name: true
                        }
                    },
                    user: true
                },
            });

            return new Response(
                JSON.stringify({
                    ticket
                }),
                { status: 200 }
            )
        } else {
            throw Error("Invalid authorization");
        }
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: (error as Error).message
            }),
            { status: 500 }
        )
    }
}

export const POST = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            ticketId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const ticketId = params.ticketId;
        if (auth) {
            await prisma.groupTicket.findFirstOrThrow({
                where: {
                    id: ticketId,
                    isActive: true,
                    OR: [
                        {
                            createdBy: auth.id
                        },
                        {
                            responses: {
                                some: {
                                    createdBy: auth.id
                                }
                            }
                        },
                        {
                            group: {
                                users: {
                                    some: {
                                        userId: auth.id,
                                        role: {
                                            OR: [
                                                {
                                                    developer: true,
                                                },
                                                {
                                                    admin: true
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            });

            const {
                message
            }: {
                message: string
            } = await req.json();

            if (message.length <= 500) {
                const lastResponse = await prisma.ticketResponse.findFirst({
                    where: {
                        createdBy: auth.id
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        createdAt: true
                    }
                });

                if (lastResponse && Date.now() - new Date(lastResponse?.createdAt).getTime() < 1000 * 10) {
                    throw Error("You must wait before sending another message");
                }

                await prisma.ticketResponse.create({
                    data: {
                        ticketId,
                        createdBy: auth.id,
                        message
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "Success!"
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("Message length is too long (500 char max)")
            }
        } else {
            throw Error("Invalid authorization");
        }
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: (error as Error).message
            }),
            { status: 500 }
        )
    }
}

export const DELETE = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            ticketId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const ticketId = params.ticketId;
        if (auth) {
            await prisma.groupTicket.findFirstOrThrow({
                where: {
                    id: ticketId,
                    isActive: true,
                    OR: [
                        {
                            createdBy: auth.id
                        },
                        {
                            responses: {
                                some: {
                                    createdBy: auth.id
                                }
                            }
                        },
                        {
                            group: {
                                users: {
                                    some: {
                                        userId: auth.id,
                                        role: {
                                            OR: [
                                                {
                                                    developer: true,
                                                },
                                                {
                                                    admin: true
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            });

            await prisma.groupTicket.update({
                where: {
                    id: ticketId
                },
                data: {
                    isActive: false
                }
            })

            return new Response(
                JSON.stringify({
                    data: "Success!"
                }),
                { status: 200 }
            )
        } else {
            throw Error("Invalid authorization");
        }
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: (error as Error).message
            }),
            { status: 500 }
        )
    }
}