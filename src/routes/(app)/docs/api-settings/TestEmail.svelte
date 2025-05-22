<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";

    const responses = [
        {
            code: 204,
            body: `null`,
        },
        {
            code: 400,
            body: `
            {
              "status": 400,
              "message": "Failed to send the test email.",
              "data": {
                "email": {
                  "code": "validation_required",
                  "message": "Missing required value."
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
                  "message": "The request requires valid record authorization token.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="发送测试邮件">
    <div class="content m-b-sm">
        <p>发送一封测试用户邮件。</p>
        <p>仅超级用户可以执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            await pb.settings.testEmail("test@example.com", "verification");
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            await pb.settings.testEmail("test@example.com", "verification");
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-success">
        <strong class="label label-primary">POST</strong>
        <div class="content">/api/settings/test/email</div>
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
                        <span class="label label-warning">可选</span>
                        <span class="txt">collection</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>认证集合的名称或 id。如果未设置，默认为 <em>_superusers</em>。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">email</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>测试邮件的接收者。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-success">必填</span>
                        <span class="txt">template</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    要发送的测试邮件模板：<br />
                    <code>verification</code>，
                    <code>password-reset</code> 或
                    <code>email-change</code>。
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
