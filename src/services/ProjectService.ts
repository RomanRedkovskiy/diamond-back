import {ProjectRepository} from "../repositories/ProjectRepository.js";
import {LogService} from "../services/LogService.js";
import {Project} from "@prisma/client";
import {Decimal} from "decimal.js";
import {projectToDto} from "../mapper/ProjectMapper.js";

export class ProjectService {

    private logService: LogService
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
        this.logService = new LogService();
    }

    async getActiveProjectById(projectId: bigint) {
        return this.projectRepository.findActiveById(projectId);
    }

    async getActiveProjects() {
        return this.projectRepository.findActive()
    }

    async updateProject(project: Project) {
        return this.projectRepository.update(project);
    }

    async projectToDto(project: Project, userId: bigint) {
        const collectedSum = await this.logService.getCollectedProjectSum(project.id);
        const investedSum = await this.logService.getInvestedProjectSum(project.id, userId);
        return projectToDto(project, new Decimal(collectedSum), new Decimal(investedSum));
    }
}
