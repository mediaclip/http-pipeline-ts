import { HttpPipelinePolicy } from "./http-pipeline-policy";
import { HttpMessage, HttpResponse } from "../models";
import { HttpPipelineOptions } from "../http-pipeline-options";
import { HttpRequestTimeoutError } from "../errors";

export class TransportHttpPipelinePolicy extends HttpPipelinePolicy {
    public constructor(private readonly httpPipelineOptions: HttpPipelineOptions) {
        super();
    }

    async process(message: HttpMessage, _pipeline: HttpPipelinePolicy[]): Promise<void> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.httpPipelineOptions.timeoutMs);

        try {
            let init = {
                method: message.request.method,
                headers: message.request.headers,
                body: message.request.body,
                signal: controller.signal,
                cache: "no-cache",
            } as RequestInit;

            if (message.request.corsOptions) {
                init.mode = "cors";
                init.credentials = message.request.corsOptions.includeCredentials ? "include" : "omit";
            }

            const fetchResponse = await (this.httpPipelineOptions.fetch ?? fetch)(message.request.url, init);

            if (message.readResponseAsBlob) {
                message.response = new HttpResponse(
                    fetchResponse.ok,
                    fetchResponse.headers,
                    fetchResponse.status,
                    undefined,
                    await fetchResponse.blob(),
                );
            } else {
                message.response = new HttpResponse(
                    fetchResponse.ok,
                    fetchResponse.headers,
                    fetchResponse.status,
                    await fetchResponse.text(),
                    undefined,
                );
            }
        } catch (error: any) {
            if (error.name === "AbortError")
                throw new HttpRequestTimeoutError("Request timeout", message.request.url, message.request.method, error);
            throw new HttpRequestTimeoutError("Failed to fetch", message.request.url, message.request.method, error);
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
