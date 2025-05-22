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
                {
                  "page": 1,
                  "perPage": 20,
                  "totalItems": 2,
                  "items": [
                    {
                      "id": "ai5z3aoed6809au",
                      "created": "2024-10-27 09:28:19.524Z",
                      "data": {
                        "auth": "_superusers",
                        "execTime": 2.392327,
                        "method": "GET",
                        "referer": "http://localhost:8090/_/",
                        "remoteIP": "127.0.0.1",
                        "status": 200,
                        "type": "request",
                        "url": "/api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
                        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                        "userIP": "127.0.0.1"
                      },
                      "message": "GET /api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
                      "level": 0
                    },
                    {
                      "id": "26apis4s3sm9yqm",
                      "created": "2024-10-27 09:28:19.524Z",
                      "data": {
                        "auth": "_superusers",
                        "execTime": 2.392327,
                        "method": "GET",
                        "referer": "http://localhost:8090/_/",
                        "remoteIP": "127.0.0.1",
                        "status": 200,
                        "type": "request",
                        "url": "/api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
                        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                        "userIP": "127.0.0.1"
                      },
                      "message": "GET /api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
                      "level": 0
                    }
                  ]
                }
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

<Accordion single title="日志列表">
    <div class="content m-b-sm">
        <p>返回分页的日志列表。</p>
        <p>仅超级用户可执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            const pageResult = await pb.logs.getList(1, 20, {
                filter: 'data.status >= 400'
            });
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            final pageResult = await pb.logs.getList(
                page: 1,
                perPage: 20,
                filter: 'data.status >= 400',
            );
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <div class="content">/api/logs</div>
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
                <td id="query-page">page</td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>分页列表的页码（<em>默认为 1</em>）。</td>
            </tr>
            <tr>
                <td id="query-perPage">perPage</td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>每页返回的最大日志数（<em>默认为 30</em>）。</td>
            </tr>
            <tr>
                <td id="query-sort">sort</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    <div class="content">
                        <p>指定 <em>ORDER BY</em> 字段。</p>
                        <p>
                            在属性前加 <code>-</code> / <code>+</code>（默认）表示降序 / 升序，例如：
                        </p>
                        <CodeBlock
                            content={`
                                // 按插入 rowid 降序，level 升序
                                ?sort=-rowid,level
                            `}
                        />
                        <p>
                            <strong>支持的日志排序字段：</strong> <br />
                            <code>@random</code>、<code>rowid</code>、<code>id</code>、<code>created</code>、
                            <code>updated</code>、<code>level</code>、<code>message</code> 以及任意
                            <code>data.*</code> 属性。
                        </p>
                    </div>
                </td>
            </tr>
            <tr>
                <td id="query-filter">filter</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    <div class="content">
                        <p>用于筛选/搜索返回日志列表的过滤表达式，例如：</p>
                        <CodeBlock
                            content={`
                                ?filter=(data.url~'test.com' && level>0)
                            `}
                        />
                        <p>
                            <strong>支持的日志过滤字段：</strong> <br />
                            <code>id</code>、<code>created</code>、<code>updated</code>、
                            <code>level</code>、<code>message</code> 以及任意 <code>data.*</code> 属性。
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
