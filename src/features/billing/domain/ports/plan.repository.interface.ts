import { Plan } from "../entities/plan.entity";

export interface IPlanRepository {
    getPlans(): Promise<Plan[]>;
}
