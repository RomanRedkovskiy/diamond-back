import {Request, Response} from 'express';
import {ProjectService} from "../services/ProjectService.js";
import jsonParser from 'json-bigint';
import {CustomError} from "../errors/CustomError.js";

export class ProjectController {

    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    async getActiveProjects(req: Request, res: Response): Promise<void> {
        try {
            const userId: bigint = (req as any).userId;
            const projects = await this.projectService.getActiveProjects();
            const projectsDtoOut = await Promise.all(projects.map(async (project) => {
                return await this.projectService.projectToDto(project, userId);
            }));
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(jsonParser.stringify(projectsDtoOut));
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({message: error.message});
            } else {
                res.status(500).json({message: error.message});
            }
        }
    }
}
