import { GetPlansUseCase } from "../application/use-cases/get-plans.use-case";
import { GetCurrentSubscriptionUseCase } from "../application/use-cases/get-current-subscription.use-case";
import { ApiPlanRepository } from "./repositories/api-plan.repository";
import { ApiSubscriptionRepository } from "./repositories/api-subscription.repository";

export function getPlansUseCase() {
    const repository = new ApiPlanRepository();
    return new GetPlansUseCase(repository);
}

export function getCurrentSubscriptionUseCase() {
    const repository = new ApiSubscriptionRepository();
    return new GetCurrentSubscriptionUseCase(repository);
}
