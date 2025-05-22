<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import FilterSyntax from "@/components/FilterSyntax.svelte";
    import FieldsQueryParam from "@/components/FieldsQueryParam.svelte";

    const responses = [
        {
            code: 200,
            body: `
                [
                  {
                    "total": 4,
                    "date": "2022-06-01 19:00:00.000"
                  },
                  {
                    "total": 1,
                    "date": "2022-06-02 12:00:00.000"
                  },
                  {
                    "total": 8,
                    "date": "2022-06-02 13:00:00.000"
                  }
                ]
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Something went wrong while processing your request. Invalid filter.",
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
        {
            code: 403,
            body: `
                {
                  "status": 403,
                  "message": "The authorized record is not allowed to perform this action.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="日志统计">
    <div class="content m-b-sm">
        <p>返回按小时聚合的日志统计数据。</p>
        <p>仅超级用户可执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '123456');

            const stats = await pb.logs.getStats({
                filter: 'data.status >= 400'
            });
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '123456');

            final stats = await pb.logs.getStats(
                filter: 'data.status >= 400'
            );
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <div class="content">/api/logs/stats</div>
        <small class="txt-hint auth-header">需要 <code>Authorization:TOKEN</code></small>
    </div>

    <div class="section-title">查询参数</div>
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
                <td id="query-filter">filter</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    <div class="content">
                        <p>用于筛选/搜索日志的过滤表达式，例如：</p>
                        <CodeBlock
                            content={`
                                ?filter=(data.url~'test.com' && level>0)
                            `}
                        />
                        <p>
                            <strong>支持的日志过滤字段：</strong> <br />
                            <code>rowid</code>、<code>id</code>、<code>created</code>、
                            <code>updated</code>、<code>level</code>、<code>message</code> 以及任意
                            <code>data.*</code> 属性。
                        </p>
                        <FilterSyntax />
                    </div>
                </td>
            </tr>
            <FieldsQueryParam />
        </tbody>
    </table>

    <div class="section-title">响应示例</div>
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
