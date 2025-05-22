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
                  "message": "An error occurred while submitting the form.",
                  "data": {
                    "collections": {
                      "code": "collections_import_failure",
                      "message": "Failed to import the collections configuration."
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

<Accordion single title="导入集合">
    <div class="content m-b-sm">
        <p>批量导入所提供的 <em>Collections</em> 配置。</p>
        <p>只有超级用户可以执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            const importData = [
                {
                    name: 'collection1',
                    schema: [
                        {
                            name: 'status',
                            type: 'bool',
                        },
                    ],
                },
                {
                    name: 'collection2',
                    schema: [
                        {
                            name: 'title',
                            type: 'text',
                        },
                    ],
                },
            ];

            await pb.collections.import(importData, false);
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            final importData = [
                CollectionModel(
                    name: "collection1",
                    schema: [
                        SchemaField(name: "status", type: "bool"),
                    ],
                ),
                CollectionModel(
                    name: "collection2",
                    schema: [
                        SchemaField(name: "title", type: "text"),
                    ],
                ),
            ];

            await pb.collections.import(importData, deleteMissing: false);
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-warning">
        <strong class="label label-primary">PUT</strong>
        <div class="content">/api/collections/import</div>
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
                        <span class="txt">collections</span>
                    </div>
                </td>
                <td>
                    <span class="label">{"Array<Collection>"}</span>
                </td>
                <td>要导入（替换和创建）的集合列表。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-warning">可选</span>
                        <span class="txt">deleteMissing</span>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>
                    如果为 <em>true</em>，所有在导入配置中未出现的现有集合和字段<strong>将被删除</strong>，包括其相关记录数据（默认为
                    <em>false</em>）。
                </td>
            </tr>
        </tbody>
    </table>
    <small class="block txt-hint m-t-10 m-b-base">
        请求体参数可通过 <em>JSON</em> 或
        <em>multipart/form-data</em> 发送。
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
