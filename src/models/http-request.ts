export type CorsOptions = { includeCredentials: boolean };

export class HttpRequest {
    constructor(
        public url: string) {
    }

    method = "GET";
    headers: { [name: string]: string } = {};
    body?: string | FormData;
    corsOptions?: CorsOptions;
}
