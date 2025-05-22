<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import FilterSyntax from "@/components/FilterSyntax.svelte";
    import ExpandQueryParam from "@/components/ExpandQueryParam.svelte";
    import FieldsQueryParam from "@/components/FieldsQueryParam.svelte";
    import SkipTotalQueryParam from "@/components/SkipTotalQueryParam.svelte";

    const responses = [
        {
            code: 200,
            body: `
                {
                  "page": 1,
                  "perPage": 100,
                  "totalItems": 2,
                  "totalPages": 1,
                  "items": [
                    {
                      "id": "ae40239d2bc4477",
                      "collectionId": "a98f514eb05f454",
                      "collectionName": "posts",
                      "updated": "2022-06-25 11:03:50.052",
                      "created": "2022-06-25 11:03:35.163",
                      "title": "test1"
                    },
                    {
                      "id": "d08dfc4f4d84419",
                      "collectionId": "a98f514eb05f454",
                      "collectionName": "posts",
                      "updated": "2022-06-25 11:03:45.876",
                      "created": "2022-06-25 11:03:45.876",
                      "title": "test2"
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
            code: 403,
            body: `
                {
                  "status": 403,
                  "message": "Only superusers can filter by '@collection.*'",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="列表/搜索记录">
    <div class="content m-b-sm">
        <p>返回支持排序和筛选的分页记录列表。</p>
        <p>
            是否允许执行此操作取决于集合的 <code>listRule</code> 配置。
        </p>
        <p class="txt-hint">
            <em>
                你可以在“仪表盘 &gt; 集合 &gt; API 预览”中查看每个集合自动生成的记录 API 文档。
            </em>
        </p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            // 获取分页记录列表
            const resultList = await pb.collection('posts').getList(1, 50, {
                filter: 'created >= "2022-01-01 00:00:00" && someField1 != someField2',
            });

            // 也可以通过 getFullList 一次性获取所有记录
            const records = await pb.collection('posts').getFullList({
                sort: '-created',
            });

            // 或仅获取第一个匹配指定筛选条件的记录
            const record = await pb.collection('posts').getFirstListItem('someField="test"', {
                expand: 'relField1,relField2.subRelField',
            });
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            // 获取分页记录列表
            final resultList = await pb.collection('posts').getList(
              page: 1,
              perPage: 50,
              filter: 'created >= "2022-01-01 00:00:00" && someField1 != someField2',
            );

            // 也可以通过 getFullList 一次性获取所有记录
            final records = await pb.collection('posts').getFullList(sort: '-created');

            // 或仅获取第一个匹配指定筛选条件的记录
            final record = await pb.collection('posts').getFirstListItem(
              'someField="test"',
              expand: 'relField1,relField2.subRelField',
            );
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <div class="content">/api/collections/<code>collectionIdOrName</code>/records</div>
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
                <td>记录所属集合的 ID 或名称。</td>
            </tr>
        </tbody>
    </table>

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
                <td>每页返回的最大记录数（<em>默认为 30</em>）。</td>
            </tr>
            <tr>
                <td valign="top" id="query-sort">sort</td>
                <td valign="top">
                    <span class="label">String</span>
                </td>
                <td valign="top">
                    <div class="content">
                        <p>指定 <em>ORDER BY</em> 字段。</p>
                        <p>
                            在属性前加 <code>-</code> / <code>+</code>（默认）表示降序 / 升序，例如：
                        </p>
                        <CodeBlock
                            content={`
                                // 按 created 降序，id 升序
                                ?sort=-created,id
                            `}
                        />
                        <p>
                            <strong>支持的记录排序字段：</strong> <br />
                            <code>@random</code>、<code>@rowid</code>、<code>id</code>，
                            <strong>以及任意集合字段</strong>。
                        </p>
                    </div>
                </td>
            </tr>
            <tr>
                <td valign="top" id="query-filter">filter</td>
                <td valign="top">
                    <span class="label">String</span>
                </td>
                <td valign="top">
                    <div class="content">
                        <p>
                            用于筛选/搜索返回记录列表的筛选表达式（会与集合的 <code>listRule</code> 共同生效），例如：
                        </p>
                        <CodeBlock
                            content={`
                                ?filter=(title~'abc' && created>'2022-01-01')
                            `}
                        />
                        <p>
                            <strong>支持的记录筛选字段：</strong> <br />
                            <code>id</code>，<strong>以及集合 schema 中的任意字段</strong>。
                        </p>
                        <FilterSyntax />
                    </div>
                </td>
            </tr>
            <ExpandQueryParam />
            <FieldsQueryParam />
            <SkipTotalQueryParam />
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
