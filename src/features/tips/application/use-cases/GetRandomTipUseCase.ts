import { Tip } from "../../domain/entities/Tip";
import { ITipGateway } from "../../domain/ports/ITipGateway";

export class GetRandomTipUseCase {
    constructor(private gateway: ITipGateway) { }

    async execute(): Promise<Tip | null> {
        return await this.gateway.getRandomTip();
    }
}
