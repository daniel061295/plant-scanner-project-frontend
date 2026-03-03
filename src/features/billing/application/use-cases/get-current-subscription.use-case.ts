import { Subscription } from "../../domain/entities/subscription.entity";
import { ISubscriptionRepository } from "../../domain/ports/subscription.repository.interface";

export class GetCurrentSubscriptionUseCase {
    constructor(private readonly subscriptionRepository: ISubscriptionRepository) { }

    async execute(): Promise<Subscription | null> {
        return await this.subscriptionRepository.getCurrentSubscription();
    }
}
