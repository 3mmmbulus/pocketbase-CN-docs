<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";

    const responses = [
        {
            code: 200,
            body: `
              [
                {
                  "status": 200,
                  "body": {
                    "collectionId": "a98f514eb05f454",
                    "collectionName": "demo",
                    "id": "ae40239d2bc4477",
                    "updated": "2022-06-25 11:03:50.052",
                    "created": "2022-06-25 11:03:35.163",
                    "title": "test1",
                    "document": "file_a98f51.txt"
                  }
                },
                {
                  "status": 200,
                  "body": {
                    "collectionId": "a98f514eb05f454",
                    "collectionName": "demo",
                    "id": "31y1gc447bc9602",
                    "updated": "2022-06-25 11:03:50.052",
                    "created": "2022-06-25 11:03:35.163",
                    "title": "test2",
                    "document": "file_f514eb0.txt"
                  }
                },
              ]
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Batch transaction failed.",
                  "data": {
                    "requests": {
                      "1": {
                        "code": "batch_request_failed",
                        "message": "Batch request failed.",
                        "response": {
                          "status": 400,
                          "message": "Failed to create record.",
                          "data": {
                            "title": {
                              "code": "validation_min_text_constraint",
                              "message": "Must be at least 3 character(s).",
                              "params": { "min": 3 }
                            }
                          }
                        }
                      }
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
                  "message": "Batch requests are not allowed.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="批量创建/更新/插入/删除记录">
    <div class="content m-b-sm">
        <p>在单个请求中批量且事务性地创建、更新、插入或删除多条记录。</p>
    </div>

    <div class="alert alert-warning">
        <div class="icon">
            <i class="ri-error-warning-line" />
        </div>
        <div class="content">
            <p>
                批量 Web API 需要在
                <em>仪表盘 &gt; 设置 &gt; 应用</em>
                中显式启用和配置。
            </p>
            <p>
                由于该端点会在单次读写事务中处理所有请求，其他查询可能会排队，如果未合理使用和配置，可能会降低应用性能（建议：尽量使用最小的最大处理时长限制，避免在慢速 S3 网络上传大文件，限制请求体大小等）。
            </p>
        </div>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            const batch = pb.createBatch();

            batch.collection('example1').create({ ... });
            batch.collection('example2').update('RECORD_ID', { ... });
            batch.collection('example3').delete('RECORD_ID');
            batch.collection('example4').upsert({ ... });

            const result = await batch.send();
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            final batch = pb.createBatch();

            batch.collection('example1').create(body: { ... });
            batch.collection('example2').update('RECORD_ID', body: { ... });
            batch.collection('example3').delete('RECORD_ID');
            batch.collection('example4').upsert(body: { ... });

            final result = await batch.send();
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-success">
        <strong class="label label-primary">POST</strong>
        <div class="content">/api/batch</div>
    </div>

    <div class="section-title">请求体参数</div>
    <p>
        请求体参数可通过 <em>application/json</em> 或 <em>multipart/form-data</em> 发送。
        <br />
        文件上传仅支持 <em>multipart/form-data</em>（详见下方说明）。
    </p>
    <table class="table-compact table-border m-b-base">
        <thead>
            <tr>
                <th>参数</th>
                <th width="80%">说明</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td valign="top">
                    <div class="flex txt-nowrap">
                        <span class="label label-success">必填</span>
                        <span>requests</span>
                    </div>
                </td>
                <td>
                    <span class="label">{`Array<Request>`}</span> - 要处理的请求列表。

                    <p>支持的批量请求操作有：</p>
                    <ul>
                        <li>记录创建 - <code>POST /api/collections/{`{collection}`}/records</code></li>
                        <li>
                            记录更新 -
                            <code>PATCH /api/collections/{`{collection}`}/records/{`{id}`}</code>
                        </li>
                        <li>
                            记录插入 - <code>PUT /api/collections/{`{collection}`}/records</code>
                            <br />
                            <small class="txt-hint">
                                （请求体必须包含 <code class="txt-sm">id</code> 字段）
                            </small>
                        </li>
                        <li>
                            记录删除 -
                            <code>DELETE /api/collections/{`{collection}`}/records/{`{id}`}</code>
                        </li>
                    </ul>
                    <p>每个批量请求元素包含以下属性：</p>
                    <ul>
                        <li><code>url path</code> <em>（可包含查询参数）</em></li>
                        <li><code>method</code> <em>（GET, POST, PUT, PATCH, DELETE）</em></li>
                        <li>
                            <code>headers</code>
                            <br />
                            <em>
                                （当前不支持自定义每个请求的 <code>Authorization</code> 头，即所有批量请求使用相同的认证状态）
                            </em>
                        </li>
                        <li><code>body</code></li>
                    </ul>
                    <p>
                        <strong>注意！</strong> 当批量请求以
                        <code>multipart/form-data</code> 发送时，常规批量操作字段应以序列化 json 的形式提交到 <code>@jsonPayload</code> 字段，文件键需遵循 <code>requests.N.fileField</code> 或 <code>requests[N].fileField</code> 格式
                        <em>
                            （通常使用 SDK 时会自动处理对象格式）
                        </em>。
                        <br />
                        如果你不使用 SDK 或希望手动构建 <code>FormData</code> 请求体，可以参考如下示例：
                        <CodeBlock
                            language="javascript"
                            content={`
                                const formData = new FormData();

                                formData.append("@jsonPayload", JSON.stringify({
                                    requests: [
                                        {
                                            method: "POST",
                                            url: "/api/collections/example/records?expand=user",
                                            body: { title: "test1" },
                                        },
                                        {
                                            method: "PATCH",
                                            url: "/api/collections/example/records/RECORD_ID",
                                            body: { title: "test2" },
                                        },
                                        {
                                            method: "DELETE",
                                            url: "/api/collections/example/records/RECORD_ID",
                                        },
                                    ]
                                }))

                                // 第一个请求的文件
                                formData.append("requests.0.document", new File(...))

                                // 第二个请求的文件
                                formData.append("requests.1.document", new File(...))
                            `}
                        />
                    </p>
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
