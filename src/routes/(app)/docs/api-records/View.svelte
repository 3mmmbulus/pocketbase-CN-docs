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
                  "id": "ae40239d2bc4477",
                  "collectionId": "a98f514eb05f454",
                  "collectionName": "posts",
                  "updated": "2022-06-25 11:03:50.052",
                  "created": "2022-06-25 11:03:35.163",
                  "title": "test1"
                }
            `,
        },
        {
            code: 403,
            body: `
                {
                  "status": 403,
                  "message": "Only superusers can perform this action.",
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

<Accordion single title="查看记录">
    <div class="content m-b-sm">
        <p>根据 ID 返回单条集合记录。</p>
        <p>
            是否允许执行此操作取决于集合的 <code>viewRule</code> 配置。
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

            const record1 = await pb.collection('posts').getOne('RECORD_ID', {
                expand: 'relField1,relField2.subRelField',
            });
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            final record1 = await pb.collection('posts').getOne('RECORD_ID',
              expand: 'relField1,relField2.subRelField',
            );
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <div class="content">
            /api/collections/<code>collectionIdOrName</code>/records/<code>recordId</code>
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
                <td>记录所属集合的 ID 或名称。</td>
            </tr>
            <tr>
                <td>recordId</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>要查看的记录 ID。</td>
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
            <ExpandQueryParam />
            <FieldsQueryParam />
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
