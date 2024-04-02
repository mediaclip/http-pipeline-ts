import { HttpPipelinePolicy } from "./policies";
import { HttpMessage } from "./models";

export interface IHttpPipeline {
    send(message: HttpMessage): Promise<void>;
}

export class HttpPipeline implements IHttpPipeline {
    constructor(
        private readonly pipeline: HttpPipelinePolicy[],
    ) {
    }

    async send(message: HttpMessage): Promise<void> {
        await this.pipeline[0].process(message, this.pipeline.slice(1));
    }
}
