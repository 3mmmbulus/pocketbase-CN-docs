<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Accordion from "@/components/Accordion.svelte";
    import ThumbFormats from "@/components/ThumbFormats.svelte";

    let responseTab = 200;

    const responses = [
        {
            code: 200,
            body: `
                {
                    "token": "..."
                }
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Failed to generate file token.",
                  "data": {}
                }
            `,
        },
    ];
</script>

<Accordion single title="生成受保护文件 token">
    <div class="content m-b-base">
        <p>
            生成用于访问<strong>受保护文件</strong>的<strong>短效文件 token</strong>。
        </p>
        <p>
            客户端必须为超级用户或已认证的普通用户（即请求中需携带有效授权 token）。
        </p>
    </div>

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-success">
        <strong class="label label-primary">POST</strong>
        <div class="content">/api/files/token</div>
        <small class="txt-hint auth-header">需要 <code>Authorization:TOKEN</code></small>
    </div>

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
