const PrismaClient = require("@prisma/client");
const prisma = new PrismaClient.PrismaClient();

const seed = async () => {
    await prisma.userRole.createMany({
        data: [
            {
                name: "Developer",
                level: 5000,
                admin: true,
                publicRelations: true,
                humanResources: true,
                developer: true
            },
            {
                name: "Owner",
                level: 1000,
                admin: true,
                publicRelations: true,
                humanResources: true,
                developer: true
            },
            {
                name: "Admin",
                level: 900,
                admin: true,
                publicRelations: true,
                humanResources: true,
                developer: true,
            },
            {
                name: "Developer",
                level: 600,
                developer: true,
            },
            {
                name: "Human Resources",
                level: 500,
                humanResources: true,
            },
            {
                name: "Public Relations",
                level: 400,
                publicRelations: true
            },
        ]
    })
}

seed();