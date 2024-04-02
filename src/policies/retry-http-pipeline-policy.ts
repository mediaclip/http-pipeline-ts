import { HttpPipelinePolicy } from "./http-pipeline-policy";
import { HttpPipelineOptions } from "../http-pipeline-options";
import { HttpMessage } from "../models";

export class RetryHttpPipelinePolicy extends HttpPipelinePolicy {
    constructor(private readonly options: HttpPipelineOptions) {
        super();
    }

    async process(message: HttpMessage, pipeline: HttpPipelinePolicy[]): Promise<void> {
        let lastError: Error | null = null;
        let retryCount = 0;
        do {
            try {
                await this.processNext(message, pipeline);
                if (!this.shouldRetry(message))
                    return;
                lastError = null;
            } catch (e: any) {
                lastError = e;
            }
            retryCount++;
            if (retryCount < this.options.retryCount)
                await this.sleep((2 ** retryCount) * 100)
        } while (retryCount < this.options.retryCount);
        if (lastError)
            throw lastError;
    }

    private shouldRetry(message: HttpMessage) {
        if (!message.response)
            return true;
        if (message.response.ok)
            return false;
        return this.options.retryableStatusCode.indexOf(message.response.status || 0) !== -1;
    }

    public sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
