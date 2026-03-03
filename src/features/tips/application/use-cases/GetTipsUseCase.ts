import { Tip } from "../../domain/entities/Tip";
import { ITipGateway } from "../../domain/ports/ITipGateway";

export class GetTipsUseCase {
    constructor(private gateway: ITipGateway) { }

    async execute(): Promise<Tip[]> {
        return await this.gateway.getTips();
    }
}
