import {PrismaClient, Project} from '@prisma/client';

export class ProjectRepository {

    private prisma = new PrismaClient();

    findActive = async () => {
        return this.prisma.project.findMany({
            where: {isActive: true},
            orderBy: {id : 'desc'}
        });
    }

    findActiveById = async (projectId: bigint) => {
        return this.prisma.project.findUnique({
            where: {id: projectId, isActive: true}
        });
    }

    update(project: Project) {
        return this.prisma.project.update({
            where: {
                id: project.id
            },
            data: project
        });
    }
}

