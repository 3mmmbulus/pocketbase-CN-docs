<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Accordion from "@/components/Accordion.svelte";
    import ThumbFormats from "@/components/ThumbFormats.svelte";

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

<Accordion single title="下载/获取文件">
    <div class="content m-b-base">
        <p>下载单个文件资源（即文件的 URL 地址）。示例：</p>
        <CodeBlock
            language="html"
            content={`
                    <img src="http://example.com/api/files/demo/1234abcd/test.png" alt="Test image" />
                `}
        />
    </div>

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <!-- prettier-ignore -->
        <div class="content">/api/files/<code>collectionIdOrName</code>/<code>recordId</code>/<code>filename</code></div>
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
                <td>包含该文件资源的记录所属集合的 ID 或名称。</td>
            </tr>
            <tr>
                <td>recordId</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>包含该文件资源的记录 ID。</td>
            </tr>
            <tr>
                <td>filename</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>文件资源的名称。</td>
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
                <td valign="top">thumb</td>
                <td valign="top">
                    <span class="label">String</span>
                </td>
                <td valign="top">
                    获取请求文件的缩略图。
                    <ThumbFormats />
                    如果文件字段选项中未定义缩略图尺寸，或文件资源不是图片（jpg, png, gif, webp），则返回原始文件资源。
                </td>
            </tr>
            <tr>
                <td valign="top">token</td>
                <td valign="top">
                    <span class="label">String</span>
                </td>
                <td valign="top">
                    可选的 <strong>文件 token</strong>，用于访问
                    <strong>受保护文件</strong>。
                    <br />
                    示例可参考
                    <a href="/docs/files-handling/#protected-files">“文件上传与处理”</a>。
                </td>
            </tr>
            <tr>
                <td valign="top">download</td>
                <td valign="top">
                    <span class="label">Boolean</span>
                </td>
                <td valign="top">
                    如果设置为真值（<em>1</em>、<em>t</em>、<em>true</em>），则文件将以 <code>Content-Disposition: attachment</code> 头返回，浏览器会直接下载文件而不是预览（如 pdf、图片、视频等）。
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
