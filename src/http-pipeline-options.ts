import { HttpPipelinePolicy } from "./policies";

export class HttpPipelineOptions {
    public fetch: typeof window.fetch;
    public retryCount = 3;
    public retryableStatusCode = [-1, 0, 408, 502, 503, 504];
    public timeoutMs = 15_000;
    public perRetryPolicies: HttpPipelinePolicy[] = [];
    public perCallPolicies: HttpPipelinePolicy[] = [];

    constructor(fetch?: typeof window.fetch) {
        this.fetch = fetch ?? window.fetch;
    }
}
