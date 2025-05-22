<script>
    import CodeBlock from "@/components/CodeBlock.svelte";

    let responseTab = 204;
    let responses = [];

    $: responses = [
        {
            code: 204,
            body: "null",
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "An error occurred while validating the submitted data.",
                  "data": {
                    "token": {
                      "code": "validation_required",
                      "message": "Missing required value."
                    }
                  }
                }
            `,
        },
    ];
</script>

<div class="api-route alert alert-success">
    <strong class="label label-primary">POST</strong>
    <div class="content">
        /api/collections/<code>collectionIdOrName</code>/confirm-verification
    </div>
</div>

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
                    <span>token</span>
                </div>
            </td>
            <td>
                <span class="label">String</span>
            </td>
            <td>邮箱验证请求邮件中的 token。</td>
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
