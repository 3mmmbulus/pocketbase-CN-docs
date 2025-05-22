<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";

    const pageTitle = "Realtime";

    const responses = [
        {
            code: 204,
            body: "null",
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Something went wrong while processing your request.",
                  "data": {
                    "clientId": {
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
                  "message": "The current and the previous request authorization don't match.",
                  "data": {}
                }
            `,
        },
        {
            code: 404,
            body: `
                {
                  "status": 404,
                  "message": "Missing or invalid client id.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<p>Realtime API 通过 Server-Sent Events (SSE) 实现。通常包含 2 个操作：</p>
<ol>
    <li>建立 SSE 连接</li>
    <li>提交客户端订阅</li>
</ol>

<p>
    SSE 事件会在 <strong>create</strong>、<strong>update</strong>
    和 <strong>delete</strong> 记录操作时发送。
</p>
<div class="alert alert-info m-t-10 m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            <strong>你可以订阅单条记录或整个集合。</strong>
        </p>
        <p>
            当你订阅<strong>单条记录</strong>时，将使用集合的
            <strong>ViewRule</strong> 判断订阅者是否有权限接收事件消息。
        </p>
        <p>
            当你订阅<strong>整个集合</strong>时，将使用集合的
            <strong>ListRule</strong> 判断订阅者是否有权限接收事件消息。
        </p>
    </div>
</div>

<div class="accordions m-b-base">
    <Accordion single title="Connect">
        <div class="api-route alert alert-info">
            <strong class="label label-primary">GET</strong>
            <div class="content">/api/realtime</div>
        </div>

        <p>
            建立新的 SSE 连接，并立即发送带有创建的 client ID 的 <code>PB_CONNECT</code> SSE 事件。
        </p>
        <p class="txt-hint">
            <strong>注意！</strong> 用户/超级用户授权会在首次
            <a href="/docs/api-realtime#set-subscriptions">Set subscriptions</a>
            调用时进行。
        </p>
        <p>
            如果已连接的客户端 5 分钟内未收到任何新消息，服务器会发送断开信号（用于防止遗忘/泄漏的连接）。如果客户端仍然活跃（如浏览器标签页未关闭），连接会自动重新建立。
        </p>
    </Accordion>

    <Accordion single title="Set subscriptions">
        <div class="api-route alert alert-success">
            <strong class="label label-primary">POST</strong>
            <div class="content">/api/realtime</div>
        </div>

        <div class="content m-b-sm">
            <p>设置新的活跃客户端订阅（并自动取消之前的订阅）。</p>
            <p>
                如果设置了 <code>Authorization</code> 头，将使用关联的用户或超级用户为客户端 SSE 连接授权。
            </p>
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
                            <span>clientId</span>
                        </div>
                    </td>
                    <td>
                        <span class="label">String</span>
                    </td>
                    <td>SSE 客户端连接的 ID。</td>
                </tr>
                <tr>
                    <td>
                        <div class="inline-flex">
                            <span class="label label-warning">可选</span>
                            <span>subscriptions</span>
                        </div>
                    </td>
                    <td>
                        <span class="label">{"Array<String>"}</span>
                    </td>
                    <td>
                        <p>
                            要设置的新客户端订阅，格式为：
                            <br />
                            <code>COLLECTION_ID_OR_NAME</code> 或
                            <code>COLLECTION_ID_OR_NAME/RECORD_ID</code>。
                        </p>
                        <p>
                            你还可以通过 <code>options</code>
                            查询参数为单个 topic 附加可选的查询和 header 参数（序列化为 json），例如：
                            <CodeBlock
                                content={`
                            COLLECTION_ID_OR_NAME/RECORD_ID?options={"query": {"abc": "123"}, "headers": {"x-token": "..."}}
                            `}
                            />
                        </p>
                        <p>留空则取消所有订阅。</p>
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
            <div class="tabs-header compact left">
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
</div>

<p class="txt-bold">
    以上所有操作，SDK 只需通过 <code>subscribe</code> 和
    <code>unsubscribe</code> 方法即可无缝处理：
</p>
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        // (Optionally) authenticate
        await pb.collection('users').authWithPassword('test@example.com', '1234567890');

        // Subscribe to changes in any record in the collection
        pb.collection('example').subscribe('*', function (e) {
            console.log(e.action);
            console.log(e.record);
        }, { /* other options like expand, custom headers, etc. */ });


        // Subscribe to changes only in the specified record
        pb.collection('example').subscribe('RECORD_ID', function (e) {
            console.log(e.action);
            console.log(e.record);
        }, { /* other options like expand, custom headers, etc. */ });


        // Unsubscribe
        pb.collection('example').unsubscribe('RECORD_ID'); // remove all 'RECORD_ID' subscriptions
        pb.collection('example').unsubscribe('*'); // remove all '*' topic subscriptions
        pb.collection('example').unsubscribe(); // remove all subscriptions in the collection
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        // (Optionally) authenticate
        await pb.collection('users').authWithPassword('test@example.com', '1234567890');

        // Subscribe to changes in any record in the collection
        pb.collection('example').subscribe('*', (e) {
            print(e.action);
            print(e.record);
        }, /* other options like expand, custom headers, etc. */);


        // Subscribe to changes only in the specified record
        pb.collection('example').subscribe('RECORD_ID', (e) {
            print(e.action);
            print(e.record);
        }, /* other options like expand, custom headers, etc. */);


        // Unsubscribe
        pb.collection('example').unsubscribe('RECORD_ID'); // remove all 'RECORD_ID' subscriptions
        pb.collection('example').unsubscribe('*'); // remove all '*' topic subscriptions
        pb.collection('example').unsubscribe(); // remove all subscriptions in the collection
    `}
/>
