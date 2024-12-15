import {Project} from "@prisma/client";
import {ProjectDtoOut} from "@/dto/project/ProjectDtoOut.js";
import {Decimal} from "decimal.js";


export function projectToDto(project: Project, collectedSum: Decimal, investedSum: Decimal): ProjectDtoOut {
    return {
        id: project.id,
        title: project.title,
        description: project.description,
        poolSum: project.poolSum,
        collectedSum: collectedSum,
        investedSum: investedSum,
    };
}