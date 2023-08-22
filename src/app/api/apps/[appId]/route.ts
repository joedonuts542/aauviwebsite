import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { DateTime } from "luxon";

export type NewApplicationInstance = {
    questions?: {
        questionId: string,
        response: string
    }[]
};

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            appId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const appId = params.appId
        if (auth && appId) {
            const previousInstance = await prisma.applicationInstance.findFirst({
                where: {
                    applicationId: appId,
                    userId: auth.robloxId,
                    OR: [
                        {
                            createdAt: {
                                gte: DateTime.now().minus({ months: 1 }).toJSDate()
                            }
                        },
                        {
                            status: "PENDING"
                        }
                    ]
                },
                include: {
                    application: {
                        include: {
                            group: {
                                select: {
                                    name: true,
                                    description: true,
                                    groupId: true
                                }
                            }
                        }
                    }
                }
            });

            if (previousInstance) {
                return new Response(
                    JSON.stringify({
                        app: previousInstance
                    }),
                    { status: 423 }
                )
            }

            const app = await prisma.groupApplication.findFirstOrThrow({
                where: {
                    id: appId
                },
                include: {
                    questions: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            type: true,
                            options: true
                        }
                    },
                    group: {
                        select: {
                            name: true,
                            description: true,
                            groupId: true
                        }
                    }
                }
            })

            return new Response(
                JSON.stringify({
                    app
                }),
                { status: 200 }
            );
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
            appId: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const appId = params.appId
        if (auth && appId) {
            const previousInstance = await prisma.applicationInstance.findFirst({
                where: {
                    applicationId: appId,
                    userId: auth.robloxId,
                    OR: [
                        {
                            createdAt: {
                                gte: DateTime.now().minus({ months: 1 }).toJSDate()
                            }
                        },
                        {
                            status: "PENDING"
                        }
                    ]
                },
                include: {
                    application: {
                        select: {
                            submitText: true
                        }
                    }
                }
            });

            if (previousInstance) {
                throw Error("You already have an outgoing application for this form");
            }

            const {
                questions
            }: NewApplicationInstance = await req.json();

            if (questions) {
                const app = await prisma.groupApplication.findFirstOrThrow({
                    where: {
                        id: appId
                    },
                    include: {
                        questions: true
                    }
                });

                for (let i = 0; i < app.questions.length; i++) {
                    let question = app.questions[i];
                    let index = questions.findIndex(q => q.questionId === question.id);
                    if (index < 0) {
                        throw Error("Some or all questions are missing from the submission");
                    }
                }

                for (let i = 0; i < questions.length; i++) {
                    let question = questions[i];
                    let index = app.questions.findIndex(q => q.id === question.questionId);
                    if (index < 0) {
                        throw Error("There is a miss-match of questions");
                    }
                }

                let passed: boolean = false;
                let totalPoints = 0;
                let score = 0;
                if (app.quiz) {
                    for (let i = 0; i < app.questions.length; i++) {
                        let question = app.questions[i];
                        let index = questions.findIndex(q => q.questionId === question.id);
                        if (index >= 0 ) {
                            if (question.correct && question.required) {
                                totalPoints += question.weight;
                                if (question.correct === questions[index].response) {
                                    score += question.weight;
                                }
                            }
                        } else if (index < 0) {
                            throw Error("Some or all questions are missing from the submission");
                        }
                    }

                    if (score / totalPoints >= 0.75) {
                        passed = true;
                    }
                }

                await prisma.applicationInstance.create({
                    data: {
                        applicationId: appId,
                        userId: auth.robloxId,
                        userName: auth.preferredUsername,
                        status: passed ? "ACCEPTED" : "PENDING",
                        points: app.quiz ? score : undefined,
                        questions: {
                            createMany: {
                                data: questions.map(q => ({
                                    questionId: q.questionId,
                                    response: q.response
                                }))
                            }
                        }
                    }
                });

                return new Response(
                    JSON.stringify({
                        data: "This application has been submitted!"
                    }),
                    { status: 200 }
                );
            } else {
                throw Error("Questions must be provided when submitting an application");
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