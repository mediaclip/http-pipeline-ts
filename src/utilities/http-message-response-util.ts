import { HttpMessage } from "../models";
import { HttpRequestFailureError } from "../errors";

export interface IHttpMessageResponseUtil {
    parseJsonResponse<TResponse>(message: HttpMessage): TResponse;
    parseTextResponse(message: HttpMessage): string;
    parseBlobResponse(message: HttpMessage): Promise<Blob>;
    readNoContent(message: HttpMessage): void;
}

export class HttpMessageResponseUtil implements IHttpMessageResponseUtil {
    parseJsonResponse<TResponse>(message: HttpMessage): TResponse {
        let parsedResponse: TResponse | undefined;
        try {
            if (message.response?.body)
                parsedResponse = JSON.parse(message.response.body);
        } catch (e) {
            /* ignored */
        }

        if (!message.response?.ok) {
            throw new HttpRequestFailureError(
                `${message.request.method} ${this.simplifyUrl(message.request.url)} responded with an error status code: ${message.response?.status}`,
                message.request.url,
                message.request.method,
                message.response?.status,
                parsedResponse || message.response?.body,
            );
        }

        if (!parsedResponse) {
            throw new HttpRequestFailureError(
                `Missing response or response cannot be deserialized as JSON`,
                message.request.url,
                message.request.method,
                message.response?.status,
                parsedResponse || message.response?.body,
            );
        }

        return parsedResponse;
    }

    parseTextResponse(message: HttpMessage): string {
        if (!message.response?.ok) {
            throw new HttpRequestFailureError(
                `${message.request.method} ${this.simplifyUrl(message.request.url)} responded with an error status code: ${message.response?.status}`,
                message.request.url,
                message.request.method,
                message.response?.status,
                message.response?.body,
            );
        }

        if (!message.response.body) {
            throw new HttpRequestFailureError(
                `No content returned by the server`,
                message.request.url,
                message.request.method,
                message.response?.status,
                message.response?.body,
            );
        }

        return message.response.body;
    }

    async parseBlobResponse(message: HttpMessage): Promise<Blob> {
        if (!message.response?.ok) {
            throw new HttpRequestFailureError(
                `${message.request.method} ${this.simplifyUrl(message.request.url)} responded with an error status code: ${message.response?.status}`,
                message.request.url,
                message.request.method,
                message.response?.status,
                await message.response?.bodyAsBlob?.text(),
            );
        }

        if (!message.response?.bodyAsBlob) {
            throw new HttpRequestFailureError(
                `No content or content was not a blob`,
                message.request.url,
                message.request.method,
                message.response?.status,
                message.response?.body,
            );
        }

        return message.response.bodyAsBlob;
    }

    readNoContent(message: HttpMessage): void {
        if (!message.response?.ok) {
            throw new HttpRequestFailureError(
                `${message.request.method} ${this.simplifyUrl(message.request.url)} responded with an error status code: ${message.response?.status}`,
                message.request.url,
                message.request.method,
                message.response?.status,
                message.response?.body,
            );
        }
    }

    private simplifyUrl(url: string): string {
        try {
            let path = url;
            if (url.includes('://')) {
                path = new URL(url).pathname
            }

            let cleanedPathSegments: string[] = [];
            for (let pathSegment of path.split('/')) {
                if (/^\d+$/.test(pathSegment)) {
                    cleanedPathSegments.push('{NumericId}')
                } else if (/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/.test(pathSegment)) {
                    cleanedPathSegments.push('{GuidId}')
                } else {
                    cleanedPathSegments.push(pathSegment)
                }
            }

            return cleanedPathSegments.join('/');
        }
        catch (e) {
            return url;
        }
    }
}
