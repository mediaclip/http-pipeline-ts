import { HttpPipelinePolicy } from "./policies";

export class HttpPipelineOptions {
    public fetch: typeof globalThis.fetch;
    public retryCount = 3;
    public retryableStatusCode = [-1, 0, 408, 502, 503, 504];
    public timeoutMs = 15_000;
    public perRetryPolicies: HttpPipelinePolicy[] = [];
    public perCallPolicies: HttpPipelinePolicy[] = [];
    public retryPolicy?: HttpPipelinePolicy;

    constructor(customFetch?: typeof globalThis.fetch) {
        this.fetch = customFetch ?? globalThis.fetch ?? fetch;
    }
}
