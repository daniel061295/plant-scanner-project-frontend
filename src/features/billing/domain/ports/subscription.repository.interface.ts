import { Subscription } from "../entities/subscription.entity";

export interface ISubscriptionRepository {
    getCurrentSubscription(): Promise<Subscription | null>;
}
