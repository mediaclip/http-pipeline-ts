export class HttpRequestTimeoutError extends Error {
    constructor(
        message: string,
        public url: string,
        public method: string,
        public innerError?: Error,
    ) {
        super(message);
        Object.setPrototypeOf(this, HttpRequestTimeoutError.prototype);
    }
}
