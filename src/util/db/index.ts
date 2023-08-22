import { PrismaClient } from "@prisma/client";

declare global {
    var dbInstance: PrismaClient
}

let prisma: PrismaClient;
if (global.dbInstance) {
    prisma = global.dbInstance
} else {
    global.dbInstance = new PrismaClient();
    prisma = global.dbInstance
}

export { prisma };