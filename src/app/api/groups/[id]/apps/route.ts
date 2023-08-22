import { NextRequest } from "next/server";

import { verifyAuth } from "@/util/db/auth";

import { prisma } from "@/util/db";
import { getGroupRole } from "@/util/db/group";
import { NewApplication } from "@/components/client/application/CreateApp";

export const GET = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
                || user.role.publicRelations
                || user.role.humanResources
            ) {
                const apps = await prisma.groupApplication.findMany({
                    where: {
                        groupId,
                    },
                    include: {
                        instances: {
                            where: {
                                status: "PENDING"
                            }
                        }
                    }
                })

                return new Response(
                    JSON.stringify({
                        apps
                    }),
                    { status: 200 }
                );
            } else {
                throw Error("You cannot view this page");
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

export const POST = async (
    req: NextRequest,
    {
        params
    }: {
        params: {
            id: string
        }
    }
) => {
    try {
        const auth = await verifyAuth(req);
        const groupId = params.id;
        if (auth) {
            const user = await getGroupRole(groupId, auth.id);
            if (
                user.role.admin
                || user.role.developer
                || user.role.publicRelations
                || user.role.humanResources
            ) {
                const app: NewApplication = await req.json();

                if (
                    !app.title
                    || app.title.length > 100
                    || !app.description
                    || app.description.length > 300
                    || !app.questions
                    || app.questions.length <= 0
                ) {
                    throw Error("Some or all details of the application are missing");
                }

                for (let i = 0; i < app.questions.length; i++) {
                    let question = app.questions[i];
                    if (
                        !question.title
                        || question.title.length > 100
                        || !question.type
                    ) { 
                        throw Error(`Question #${i + 1} is missing required information`);
                    }

                    if (question.type === "CHECK" || question.type === "SELECT") {
                        if (!question.options) {
                            throw Error(`Question #${i + 1} must have options`);
                        }

                        if (question.options.map(o => o.length).reduce((a: number, b: number) => a + b, 0) > 1000) {
                            throw Error(`Question #${i + 1} has options that are too long.`)
                        }
                    }
                }

                const application = await prisma.groupApplication.create({
                    data: {
                        groupId,
                        title: app.title,
                        description: app.description,
                        submitText: app.submitText,
                        quiz: app.quiz
                    }
                });

                await prisma.applicationQuestion.createMany({
                    data: app.questions.map((q, i) => ({
                        applicationId: application.id,
                        title: q.title?.toString() || `Unnamed Question #${i + 1}`,
                        description: q.description,
                        type: q.type || "TEXT",
                        options: q.options || [],
                        correct: q.correct,
                        weight: q.weight,
                        required: q.required
                    }))
                });

                return new Response(
                    JSON.stringify({
                        data: "Success!"
                    }),
                    { status: 200 }
                )
            } else {
                throw Error("You cannot view this page");
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
