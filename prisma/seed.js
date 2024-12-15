import {PrismaClient, UserRole} from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {

    const users = [
        {
            login: 'admin',
            password: 'admin',
            role: UserRole.ADMIN,
            inviterId: 0
        },
        {
            login: 'topuser',
            password: 'topuser',
            role: UserRole.CLIENT,
            inviterId: 0
        }
    ];

    for (const user of users) {
        const { login } = user;

        const userExists = await prisma.user.findUnique({
            where: { login }
        });

        if (!userExists) {
            await prisma.user.create({
                data: user
            });
        } else {
            console.log(`User with login "${login}" already exists.`);
        }
    }

    const projects = [
        {
            title: 'Luxury Apartments in Downtown',
            description: 'Experience modern living in the heart of the city with these luxurious apartments featuring stunning city views.',
            poolSum: 1500000.00,
            isActive: true,
        },
        {
            title: 'Seaside Resort Residences',
            description: 'Escape to a tranquil seaside resort with these beautiful beachfront residences offering panoramic ocean views.',
            poolSum: 2500000.00,
            isActive: true,
        },
        {
            title: 'Urban Studio Apartments',
            description: 'Discover cozy and stylish studio apartments designed for urban living with convenient access to amenities and transportation.',
            poolSum: 800000.00,
            isActive: true,
        }
    ];

    for (const project of projects) {
        const { title } = project;

        const projectExists = await prisma.project.findUnique({
            where: { title }
        });

        if (!projectExists) {
            await prisma.project.create({
                data: project
            });
        } else {
            console.log(`Project with title "${title}" already exists.`);
        }
    }

    console.log('Seed data inserted successfully!');
}

main()
    .catch((e) => {
        console.error('Error inserting seed data:', e);
        process.exit(1); // Exit with failure code
    })
    .finally(async () => {
        await prisma.$disconnect(); // Ensure Prisma disconnects
    });
