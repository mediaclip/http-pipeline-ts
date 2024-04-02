export class HttpRequestFailureError extends Error {
    constructor(
        message: string,
        public url: string,
        public method: string,
        public status?: number,
        public jsonBody?: any,
    ) {
        super(message);
        Object.setPrototypeOf(this, HttpRequestFailureError.prototype);
    }

    tryParseJsonBody<T>() : T | undefined {
        if (!this.jsonBody)
            return undefined;
        try {
            return JSON.parse(this.jsonBody)
        }
        catch (e) {
            return undefined;
        }
    }
}
