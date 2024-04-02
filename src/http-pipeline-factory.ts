import { HttpPipelinePolicy, RetryHttpPipelinePolicy, TransportHttpPipelinePolicy } from "./policies";
import { HttpPipeline, IHttpPipeline } from "./http-pipeline";
import { HttpPipelineOptions } from "./http-pipeline-options";

export interface IHttpPipelineFactory {
    build(options: HttpPipelineOptions): IHttpPipeline;
}

export class HttpPipelineFactory {
    build(options: HttpPipelineOptions): IHttpPipeline {
        const pipeline: HttpPipelinePolicy[] = [
            ...options.perCallPolicies,
            new RetryHttpPipelinePolicy(options),
            ...options.perRetryPolicies,
            new TransportHttpPipelinePolicy(options),
        ];
        return new HttpPipeline(pipeline);
    }
}
