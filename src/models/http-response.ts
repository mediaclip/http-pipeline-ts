export class HttpResponse {
    constructor(
        public ok: boolean = false,
        public headers: Headers,
        public status: number,
        public body?: string,
        public bodyAsBlob?: Blob,
    ) {
    }
}
