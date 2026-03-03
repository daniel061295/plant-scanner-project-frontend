export interface PlanFeatures {
    tier: string;
    [key: string]: any;
}

export class Plan {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number,
        public readonly scanLimitPerDay: number,
        public readonly adsEnabled: boolean,
        public readonly features: PlanFeatures,
        public readonly isActive: boolean
    ) { }
}
