import {
    HttpMessage,
    HttpMessageBuilder,
    HttpMessageResponseUtil,
    HttpPipelineFactory,
    HttpPipelineOptions,
    HttpPipelinePolicy,
} from '@mediaclip/http-pipeline';

type BlogResponse = {
    id: number;
    // ...
}

type Authentication = {
    type: 'JWT',
    token: string
} | {
    type: 'ApiKey',
    apiKey: string
}


class AuthenticationHttpPipelinePolicy extends HttpPipelinePolicy {
    static propertyKey: symbol = Symbol();

    async process(message: HttpMessage, pipeline: HttpPipelinePolicy[]): Promise<void> {
        let authentication = message.properties[AuthenticationHttpPipelinePolicy.propertyKey] as Authentication;
        if (authentication) {
            switch (authentication.type) {
                case 'JWT':
                    message.request.headers['Authorization'] = 'Bearer ' + authentication.token;
                    break;
                case 'ApiKey':
                    message.request.headers['Authorization'] = authentication.apiKey;
                    break;
                // .... Other complex scenario, like request that need to be signed, with timestamp etc...
            }
        }
        await this.processNext(message, pipeline);
    }
}

const httpPipelineFactory = new HttpPipelineFactory();
let httpPipelineOptions = new HttpPipelineOptions();
httpPipelineOptions.perRetryPolicies.push(new AuthenticationHttpPipelinePolicy());
const pipeline = httpPipelineFactory.build(httpPipelineOptions);
const httpMessageResponseUtil = new HttpMessageResponseUtil();

// Use API Key authentication
{
    const message = new HttpMessageBuilder()
        .withUrl('/api/posts')
        .withProperty<Authentication>(AuthenticationHttpPipelinePolicy.propertyKey, {type: 'ApiKey', apiKey: 'some-api-key'})
        .build();

    await pipeline.send(message);
    httpMessageResponseUtil.parseJsonResponse<BlogResponse>(message);
}
// Use Bearer token authentication
{
    const message = new HttpMessageBuilder()
        .withUrl('/api/posts')
        .withProperty<Authentication>(AuthenticationHttpPipelinePolicy.propertyKey, {type: 'JWT', token: 'some-token'})
        .build();

    await pipeline.send(message);
    httpMessageResponseUtil.parseJsonResponse<BlogResponse>(message);
}
