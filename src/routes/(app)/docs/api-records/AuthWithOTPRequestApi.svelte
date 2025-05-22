<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CommonHelper from "@/utils/CommonHelper";

    let responseTab = 200;
    let responses = [];

    $: responses = [
        {
            code: 200,
            body: JSON.stringify(
                {
                    otpId: CommonHelper.randomString(15),
                },
                null,
                2,
            ),
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "An error occurred while validating the submitted data.",
                  "data": {
                    "email": {
                      "code": "validation_is_email",
                      "message": "Must be a valid email address."
                    }
                  }
                }
            `,
        },
        {
            code: 429,
            body: `
                {
                  "status": 429,
                  "message": "You've send too many OTP requests, please try again later.",
                  "data": {}
                }
            `,
        },
    ];
</script>

<div class="api-route alert alert-success">
    <strong class="label label-primary">POST</strong>
    <div class="content">
        /api/collections/<code>collectionIdOrName</code>/request-otp
    </div>
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
            <td>
                <div class="inline-flex">
                    <span class="label label-success">必填</span>
                    <span>email</span>
                </div>
            </td>
            <td>
                <span class="label">String</span>
            </td>
            <td>要发送 OTP 请求的认证记录邮箱地址（如存在）。</td>
        </tr>
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
