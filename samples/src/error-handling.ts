import {
    HttpMessageBuilder,
    HttpMessageResponseUtil,
    HttpPipelineFactory,
    HttpPipelineOptions,
    HttpRequestFailureError
} from '@mediaclip/http-pipeline';

type ErrorResponse = {
    message: string;
}

const httpPipelineFactory = new HttpPipelineFactory();
const pipeline = httpPipelineFactory.build(new HttpPipelineOptions());
const httpMessageResponseUtil = new HttpMessageResponseUtil();

const message = new HttpMessageBuilder()
    .withMethod('POST')
    .withUrl('/api/user')
    .withQueryString('test', 'true')
    .withHeader('Authorization', 'Bearer some-auth-token')
    .withJsonBody({
        title: 'some-title',
        content: 'some-content'
    })
    .build();

// This will not throw for any error returned by the server.
// It will throw for an `HttpRequestTimeoutError` timeout and fetch failure.
await pipeline.send(message);

try {
    httpMessageResponseUtil.parseJsonResponse<unknown>(message);
} catch (e) {
    if (e instanceof HttpRequestFailureError) {
        // Here you have access to all the info from the response
        //   - e.url contains the request url
        //   - e.method contains the request method (GET | POST | ...)
        //   - e.status contains the status code
        //   - e.body contains the body
        switch (e.status) {
            case 400:
                const parsedJsonBody = e.tryParseBodyAsJson<ErrorResponse>();
                if (parsedJsonBody) {
                    throw new Error('Validation error: ' + parsedJsonBody.message);
                }
                throw new Error('Bad Request');
            case 404:
                throw Error('Not found');
            case 403:
                throw Error('Forbidden');
        }
    }
    throw e;
}
