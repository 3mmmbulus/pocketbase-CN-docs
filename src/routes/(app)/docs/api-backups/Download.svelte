<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Accordion from "@/components/Accordion.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";

    let responseTab = 200;

    const responses = [
        {
            code: 200,
            body: `[file resource]`,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Filesystem initialization failure.",
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
</script>

<Accordion single title="下载备份">
    <div class="content m-b-base">
        <p>下载单个备份文件。</p>
        <p>仅超级用户可以执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            const token = await pb.files.getToken();

            const url = pb.backups.getDownloadUrl(token, 'pb_data_backup.zip');
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            final token = await pb.files.getToken();

            final url = pb.backups.getDownloadUrl(token, 'pb_data_backup.zip');
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <!-- prettier-ignore -->
        <div class="content">/api/backups/<code>key</code></div>
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
                <td>key</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>要下载的备份文件 key。</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">查询参数</div>
    <table class="table-compact table-border m-b-base">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="60%">说明</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td valign="top">token</td>
                <td valign="top">
                    <span class="label">String</span>
                </td>
                <td valign="top">
                    超级用户的 <strong>文件 token</strong>，用于授权访问
                    <strong>备份文件</strong>。
                </td>
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
</Accordion>
