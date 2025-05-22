<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";

    const responses = [
        {
            code: 200,
            body: `
                {
                    "secret": "..."
                }
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Failed to generate client secret. Raw error:...",
                  "data": {}
                }
            `,
        },
        {
            code: 401,
            body: `
                {
                  "status": 401,
                  "message": "The request requires valid record authorization token.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="生成 Apple 客户端密钥">
    <div class="content m-b-sm">
        <p>生成新的 Apple OAuth2 客户端密钥。</p>
        <p>仅超级用户可以执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            await pb.settings.generateAppleClientSecret(clientId, teamId, keyId, privateKey, duration)
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            await pb.settings.generateAppleClientSecret(clientId, teamId, keyId, privateKey, duration)
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-success">
        <strong class="label label-primary">POST</strong>
        <div class="content">/api/settings/apple/generate-client-secret</div>
        <small class="txt-hint auth-header">需要 <code>Authorization:TOKEN</code></small>
    </div>

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
                        <span class="txt">clientId</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>你的应用标识符（即 Service ID）。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">teamId</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    与你的开发者账号关联的 10 位字符串（通常可在 Apple Developer 网站你的名字旁边找到）。
                </td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">keyId</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    为“Sign in with Apple”私钥生成的 10 位密钥标识符，关联你的开发者账号。
                </td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">privateKey</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>privateKey 是与你的应用关联的私钥。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">duration</span>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>
                    duration 指定生成的 JWT token 有效时长。
                    <br />
                    该值必须为秒，最大 15777000（约 6 个月）。
                </td>
            </tr>
        </tbody>
    </table>
    <small class="block txt-hint m-t-10 m-b-base">
        请求体参数可通过 <em>JSON</em> 或
        <em>multipart/form-data</em> 方式发送。
    </small>

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
