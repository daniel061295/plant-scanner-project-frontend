import { Tip } from "../entities/Tip";

export interface ITipGateway {
    getTips(): Promise<Tip[]>;
    getRandomTip(): Promise<Tip | null>;
}
