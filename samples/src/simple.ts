import {
    HttpMessageBuilder,
    HttpMessageResponseUtil,
    HttpPipelineFactory,
    HttpPipelineOptions,
} from '@mediaclip/http-pipeline';

type BlogResponse = {
    id: number;
    // ...
}

const httpPipelineFactory = new HttpPipelineFactory();
const pipeline = httpPipelineFactory.build(new HttpPipelineOptions());
const httpMessageResponseUtil = new HttpMessageResponseUtil();

const message = new HttpMessageBuilder()
    .withMethod('POST')
    .withUrl('/api/blogs')
    .withQueryString('test', 'true')
    .withHeader('Authorization', 'Bearer some-auth-token')
    .withJsonBody({
        title: 'some-title',
        content: 'some-content'
    })
    .build();

await pipeline.send(message);
const blog = httpMessageResponseUtil.parseJsonResponse<BlogResponse>(message);
console.info(blog.id);
