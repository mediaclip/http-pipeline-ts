export class HttpRequestFailureError extends Error {
    constructor(
        message: string,
        public url: string,
        public method: string,
        public status?: number,
        public body?: any,
    ) {
        super(message);
        Object.setPrototypeOf(this, HttpRequestFailureError.prototype);
    }

    tryParseBodyAsJson<T>() : T | undefined {
        if (!this.body)
            return undefined;
        try {
            return JSON.parse(this.body)
        }
        catch (e) {
            return undefined;
        }
    }
}
