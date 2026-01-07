import { CorsOptions, HttpMessage } from "../models";

export class HttpMessageBuilder {
    private method?: "GET" | "POST" | "HEAD" | "PUT" | "PATCH" | "DELETE";
    private url?: string;
    private queryStrings: { name: string, value: string }[] = [];
    private headers: { [name: string]: string } = {};
    private properties: { [name: symbol]: any } = {};
    private body?: string | FormData | Blob | ArrayBuffer;
    private corsOptions?: CorsOptions;
    private shouldReadResponseAsBlob = false;

    public constructor() {
    }

    public withMethod(method: "GET" | "POST" | "HEAD" | "PUT" | "PATCH" | "DELETE"): this {
        this.method = method;
        return this;
    }

    public withUrl(url: string): this {
        this.url = url;
        return this;
    }

    public withQueryString(name: string, value?: string | null): this {
        if (value)
            this.queryStrings.push({ name, value });
        return this;
    }

    public withJsonBody(body: object): this {
        this.headers["Content-Type"] = "application/json; charset=utf-8";
        this.body = JSON.stringify(body);
        return this;
    }

    public withFormDataBody(formData: FormData): this {
        this.headers["Content-Type"] = "application/json; charset=utf-8";
        this.body = formData;
        return this;
    }

    public withRawBody(body: Blob | ArrayBuffer, contentType?: string): this {
        if (contentType)
            this.headers["Content-Type"] = contentType;
        this.body = body;
        return this;
    }

    public withHeader(name: string, value?: string | null): this {
        if (value) {
            this.headers[name] = value;
        }
        return this;
    }

    public withProperty<T>(name: symbol, value: T): this;
    public withProperty(name: symbol, value: any): this {
        this.properties[name] = value;
        return this;
    }

    public withCors(corsOptions: CorsOptions): this {
        this.corsOptions = corsOptions;
        return this;
    }

    public readResponseAsBlob(): this {
        this.shouldReadResponseAsBlob = true;
        return this;
    }

    public build(): HttpMessage {
        if (!this.url)
            throw new Error("You need to specify an url");
        let url = this.url;
        if (this.queryStrings.length > 0) {
            url = this.appendQueryStrings(url, this.queryStrings);
        }
        const httpMessage = new HttpMessage(url);
        httpMessage.properties = { ...this.properties };
        httpMessage.request.method = this.method || "GET";
        httpMessage.request.headers = { ...this.headers };
        httpMessage.request.body = this.body;
        httpMessage.request.corsOptions = this.corsOptions;
        httpMessage.readResponseAsBlob = this.shouldReadResponseAsBlob;

        return httpMessage;
    }

    private appendQueryStrings(url: string, queryStrings: { name: string; value: string }[]) {
        let firstQueryString = url.indexOf("?") === -1;
        for (const queryString of queryStrings) {
            url += this.buildQueryString(queryString.name, queryString.value, firstQueryString);
            firstQueryString = false;
        }
        return url;
    }

    private buildQueryString(name: string, value: string, isFirst: boolean) {
        const separator = isFirst ? "?" : "&";
        return `${separator}${name}=${encodeURIComponent(value)}`;
    }
}
