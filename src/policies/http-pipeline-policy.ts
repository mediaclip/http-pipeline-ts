import { HttpMessage } from "../models";

export abstract class HttpPipelinePolicy {
    protected async processNext(message: HttpMessage, pipeline: HttpPipelinePolicy[]): Promise<void> {
        if (pipeline.length == 0)
            throw new Error("All http pipeline policies has been consumed. processNext cannot call any policy");
        await pipeline[0].process(message, pipeline.slice(1));
    }

    public abstract process(message: HttpMessage, pipeline: HttpPipelinePolicy[]): Promise<void>;
}
