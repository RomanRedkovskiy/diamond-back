import {Decimal} from "decimal.js";

export class ProjectDtoOut {

    id: BigInt
    title: string;
    description: string | undefined;
    poolSum: Decimal;
    collectedSum: Decimal
    investedSum: Decimal

}