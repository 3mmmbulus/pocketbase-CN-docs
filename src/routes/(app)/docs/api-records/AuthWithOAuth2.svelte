<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import ExpandQueryParam from "@/components/ExpandQueryParam.svelte";
    import FieldsQueryParam from "@/components/FieldsQueryParam.svelte";

    const responses = [
        {
            code: 200,
            body: `
                {
                  "token": "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjRxMXhsY2xtZmxva3UzMyIsInR5cGUiOiJhdXRoUmVjb3JkIiwiY29sbGVjdGlvbklkIjoiX3BiX3VzZXJzX2F1dGhfIiwiZXhwIjoyMjA4OTg1MjYxfQ.UwD8JvkbQtXpymT09d7J6fdA0aP9g4FJ1GPh_ggEkzc",
                  "record": {
                    "id": "8171022dc95a4ed",
                    "collectionId": "d2972397d45614e",
                    "collectionName": "users",
                    "created": "2022-06-24 06:24:18.434Z",
                    "updated": "2022-06-24 06:24:18.889Z",
                    "username": "test@example.com",
                    "email": "test@example.com",
                    "verified": true,
                    "emailVisibility": false,
                    "someCustomField": "example 123"
                  },
                  "meta": {
                    "id": "abc123",
                    "name": "John Doe",
                    "username": "john.doe",
                    "email": "test@example.com",
                    "isNew": false,
                    "avatarURL": "https://example.com/avatar.png",
                    "rawUser": {...},
                    "accessToken": "...",
                    "refreshToken": "...",
                    "expiry": "..."
                  }
                }
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "An error occurred while submitting the form.",
                  "data": {
                    "provider": {
                      "code": "validation_required",
                      "message": "Missing required value."
                    }
                  }
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title={"OAuth2 认证"}>
    <div class="content m-b-sm">
        <p>使用 OAuth2 提供商进行认证，并返回新的认证令牌和记录数据。</p>
        <p>此操作通常应在提供商登录页面重定向后立即调用。</p>
        <p>
            你也可以查看
            <a href="/docs/authentication#web-oauth2-integration">OAuth2 网页集成示例</a>。
        </p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            const authData = await pb.collection('users').authWithOAuth2Code(
                'google',
                'CODE',
                'VERIFIER',
                'REDIRECT_URL',
                // optional data that will be used for the new account on OAuth2 sign-up
                {
                  'name': 'test',
                },
            );

            // after the above you can also access the auth data from the authStore
            console.log(pb.authStore.isValid);
            console.log(pb.authStore.token);
            console.log(pb.authStore.record.id);

            // "logout" the last authenticated record
            pb.authStore.clear();
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            final authData = await pb.collection('users').authWithOAuth2Code(
              'google',
              'CODE',
              'VERIFIER',
              'REDIRECT_URL',
              // optional data that will be used for the new account on OAuth2 sign-up
              createData: {
                'name': 'test',
              },
            );

            // after the above you can also access the auth data from the authStore
            print(pb.authStore.isValid);
            print(pb.authStore.token);
            print(pb.authStore.record.id);

            // "logout" the last authenticated record
            pb.authStore.clear();
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-success">
        <strong class="label label-primary">POST</strong>
        <div class="content">/api/collections/<code>collectionIdOrName</code>/auth-with-oauth2</div>
    </div>

    <div class="section-title">路径参数</div>
    <table class="table-compact table-border m-b-base">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="50%">说明</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>collectionIdOrName</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>认证集合的 ID 或名称。</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">请求体参数</div>
    <table class="table-compact table-border">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="50%">说明</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">provider</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>OAuth2 客户端提供商名称（如 "google"）。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">code</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>初始请求返回的授权码。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">codeVerifier</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>初始请求中作为 code_challenge 一部分发送的 code verifier。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">redirectUrl</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>初始请求中发送的重定向地址。</td>
            </tr>
            <tr>
                <td valign="top">
                    <div class="inline-flex">
                        <span class="label label-warning">可选</span>
                        <span>createData</span>
                    </div>
                </td>
                <td valign="top">
                    <span class="label">Object</span>
                </td>
                <td valign="top">
                    <p>OAuth2 注册新账号时用于创建认证记录的可选数据。</p>
                    <p>
                        创建的认证记录必须满足常规 <strong>create</strong> 操作的相同要求和校验。
                        <br />
                        <em>
                            数据只能为 <code>json</code>，即 <code>multipart/form-data</code> 以及文件上传当前在 OAuth2 注册时不支持。
                        </em>
                    </p>
                </td>
            </tr>
        </tbody>
    </table>
    <small class="block txt-hint m-t-10 m-b-base">
        请求体参数可通过 <em>JSON</em> 或
        <em>multipart/form-data</em> 发送。
    </small>

    <div class="section-title">查询参数</div>
    <table class="table-compact table-border m-b-base">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="60%">说明</th>
            </tr>
        </thead>
        <tbody>
            <ExpandQueryParam />
            <FieldsQueryParam prefix="record." />
        </tbody>
    </table>

    <div class="section-title">响应</div>
    <div class="tabs">
        <div class="tabs-header compact combined left">
            {#each responses as response (response.code)}
                <button
                    class="tab-item"
                    class:active={responseTab === response.code}
                    on:click={() => (responseTab = response.code)}
                >
                    {response.code}
                </button>
            {/each}
        </div>
        <div class="tabs-content">
            {#each responses as response (response.code)}
                <div class="tab-item" class:active={responseTab === response.code}>
                    <CodeBlock content={response.body} />
                </div>
            {/each}
        </div>
    </div>
</Accordion>
