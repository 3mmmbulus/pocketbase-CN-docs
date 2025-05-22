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
                  "collectionId": "a98f514eb05f454",
                  "collectionName": "demo",
                  "id": "ae40239d2bc4477",
                  "updated": "2022-06-25 11:03:50.052",
                  "created": "2022-06-25 11:03:35.163",
                  "title": "Lorem ipsum"
                }
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Failed to create record.",
                  "data": {
                    "title": {
                      "code": "validation_required",
                      "message": "Missing required value."
                    }
                  }
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
                  "message": "The requested resource wasn't found. Missing collection context.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="更新记录">
    <div class="content m-b-sm">
        <p>更新已有集合<em>记录</em>。</p>
        <p>
            是否允许执行此操作取决于集合的 <code>updateRule</code> 配置。
        </p>
        <p class="txt-hint">
            <em>你可以在仪表盘中查看每个集合自动生成的记录 API 文档。</em>
        </p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            const record = await pb.collection('demo').update('YOUR_RECORD_ID', {
                title: 'Lorem ipsum',
            });
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            final record = await pb.collection('demo').update('YOUR_RECORD_ID', body: {
                'title': 'Lorem ipsum',
            });
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-warning">
        <strong class="label label-primary">PATCH</strong>
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
                <td>要更新的记录 ID。</td>
            </tr>
        </tbody>
    </table>

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
                <td colspan="3" class="txt-hint">集合字段</td>
            </tr>
            <tr>
                <td colspan="3">
                    <strong>集合 schema 中的任意字段。</strong>
                </td>
            </tr>

            <tr>
                <td colspan="3" class="txt-hint">额外认证记录字段</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-warning">可选</span>
                        <span>oldPassword</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    原认证记录密码。
                    <br />
                    仅在修改记录密码时必填。超级用户和拥有“管理”权限的认证记录可跳过此字段。
                </td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-warning">可选</span>
                        <span>password</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>新认证记录密码。</td>
            </tr>
            <tr>
                <td>
                    <div class="inline-flex">
                        <span class="label label-warning">可选</span>
                        <span>passwordConfirm</span>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>新认证记录密码确认。</td>
            </tr>
        </tbody>
    </table>
    <small class="block txt-hint m-t-10 m-b-base">
        请求体参数可通过 <em>JSON</em> 或
        <em>multipart/form-data</em> 发送。
        <br />
        文件上传仅支持 <em>multipart/form-data</em>。
    </small>

    <div class="section-title">查询参数</div>
    <table class="table-compact table-border m-b-lg">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="60%">说明</th>
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
