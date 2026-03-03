export interface SubscriptionFeatures {
    tier: string;
    [key: string]: any;
}

export class Subscription {
    constructor(
        public readonly planName: string,
        public readonly planId: string,
        public readonly status: string,
        public readonly scanLimitPerDay: number,
        public readonly adsEnabled: boolean,
        public readonly usageToday: number,
        public readonly features: SubscriptionFeatures
    ) { }
}
