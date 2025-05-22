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
                  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJfcGJjX2MwcHdrZXNjcXMiLCJleHAiOjE3MzAzNjgxMTUsImlkIjoicXkwMmMxdDBueDBvanFuIiwicmVmcmVzaGFibGUiOmZhbHNlLCJ0eXBlIjoiYXV0aCJ9.1JOaE54TyPdDLf0mb0T6roIYeh8Y1HfJvDlYZADMN4U",
                  "record": {
                    "id": "8171022dc95a4ed",
                    "collectionId": "d2972397d45614e",
                    "collectionName": "users",
                    "created": "2022-06-24 06:24:18.434Z",
                    "updated": "2022-06-24 06:24:18.889Z",
                    "username": "test@example.com",
                    "email": "test@example.com",
                    "verified": false,
                    "emailVisibility": true,
                    "someCustomField": "example 123"
                  }
                }
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "The request requires valid record authorization token to be set.",
                  "data": {
                    "duration": {
                      "code": "validation_min_greater_equal_than_required",
                      "message": "Must be no less than 0."
                    }
                  }
                }
            `,
        },
        {
            code: 401,
            body: `
                {
                  "status": 401,
                  "message": "An error occurred while validating the submitted data.",
                  "data": {}
                }
            `,
        },
        {
            code: 403,
            body: `
                {
                  "status": 403,
                  "message": "The authorized record model is not allowed to perform this action.",
                  "data": {}
                }
            `,
        },
        {
            code: 404,
            body: `
                {
                  "status": 404,
                  "message": "The requested resource wasn't found.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="模拟登录">
    <div class="content m-b-sm">
        <p>
            模拟登录允许你通过生成一个<strong>不可刷新</strong>的认证令牌，以其他用户身份进行认证。
        </p>
        <p>仅超级用户可执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            // 以超级用户身份认证
            await pb.collection("_superusers").authWithPassword("test@example.com", "1234567890");

            // 模拟登录
            // （自定义令牌时长为可选，单位为秒）
            const impersonateClient = pb.collection("users").impersonate("USER_RECORD_ID", 3600)

            // 打印模拟登录的 token 和用户数据
            console.log(impersonateClient.authStore.token);
            console.log(impersonateClient.authStore.record);

            // 以模拟用户身份发送请求
            impersonateClient.collection("example").getFullList();
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            // 以超级用户身份认证
            await pb.collection("_superusers").authWithPassword("test@example.com", "1234567890");

            // 模拟登录
            // （自定义令牌时长为可选，单位为秒）
            final impersonateClient = pb.collection("users").impersonate("USER_RECORD_ID", 3600)

            // 打印模拟登录的 token 和用户数据
            print(impersonateClient.authStore.token);
            print(impersonateClient.authStore.record);

            // 以模拟用户身份发送请求
            impersonateClient.collection("example").getFullList();
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-success">
        <strong class="label label-primary">POST</strong>
        <div class="content">
            /api/collections/<code>collectionIdOrName</code>/impersonate/<code>id</code>
        </div>
        <small class="txt-hint auth-header">需要 <code>Authorization:TOKEN</code></small>
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
            <tr>
                <td>id</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>要模拟登录的认证记录 ID。</td>
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
                        <span class="label label-warning">可选</span>
                        <span class="txt">duration</span>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>
                    <span>自定义 JWT <code>exp</code> 过期时长（单位：秒）。</span>
                    <br />
                    未设置或为 0 时，使用集合默认的认证令牌时长。
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
