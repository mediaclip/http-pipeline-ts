import { HttpRequest } from "./http-request";
import { HttpResponse } from "./http-response";

export class HttpMessage {
    constructor(url: string) {
        this.request = new HttpRequest(url);
    }

    properties: Record<symbol, any> = {};
    request: HttpRequest;
    response?: HttpResponse;
    readResponseAsBlob?: boolean;
}
