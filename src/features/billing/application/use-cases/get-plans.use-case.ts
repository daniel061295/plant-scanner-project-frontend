import { Plan } from "../../domain/entities/plan.entity";
import { IPlanRepository } from "../../domain/ports/plan.repository.interface";

export class GetPlansUseCase {
    constructor(private readonly planRepository: IPlanRepository) { }

    async execute(): Promise<Plan[]> {
        return await this.planRepository.getPlans();
    }
}
