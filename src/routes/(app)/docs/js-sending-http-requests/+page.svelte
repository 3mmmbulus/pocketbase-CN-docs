<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<Toc />

<HeadingLink title="概述" />
<p>
    你可以使用全局 <code>$http.send(config)</code> 辅助方法向外部服务发送 HTTP 请求。
    <br />
    这可以用于例如从外部数据源获取数据，或向支付服务商 API 发送自定义请求等场景。
</p>

<p>下面列出了当前支持的所有 config 配置项及其默认值。</p>
<CodeBlock
    language="javascript"
    content={`
        // throws on timeout or network connectivity error
        const res = $http.send({
            url:     "",
            method:  "GET",
            body:    "", // ex. JSON.stringify({"test": 123}) or new FormData()
            headers: {}, // ex. {"content-type": "application/json"}
            timeout: 120, // in seconds
        })

        console.log(res.headers)    // the response headers (ex. res.headers['X-Custom'][0])
        console.log(res.cookies)    // the response cookies (ex. res.cookies.sessionId.value)
        console.log(res.statusCode) // the response HTTP status code
        console.log(res.body)       // the response body as plain bytes array
        console.log(res.json)       // the response body as parsed json array or map
    `}
/>

<p class="m-t-sm">
    下面是一个示例，将根据 openlibrary.org 的 ISBN 信息为单本图书记录补充数据。
</p>
<CodeBlock
    language="javascript"
    content={`
        onRecordCreateRequest((e) => {
            let isbn = e.record.get("isbn");

            // try to update with the published date from the openlibrary API
            try {
                const res = $http.send({
                    url: "https://openlibrary.org/isbn/" + isbn + ".json",
                    headers: {"content-type": "application/json"}
                })

                if (res.statusCode == 200) {
                    e.record.set("published", res.json.publish_date)
                }
            } catch (err) {
                e.app.logger().error("Failed to retrieve book data", "error", err);
            }

            return e.next()
        }, "books")
    `}
/>

<HeadingLink title="multipart/form-data 请求" tag="h5" />
<p>
    若要发送 <code>multipart/form-data</code> 请求（如上传文件），请求的
    <code>body</code> 必须为 <code>FormData</code> 实例。
</p>
<p>
    PocketBase JSVM 的 <code>FormData</code> 拥有与
    <a
        href="https://developer.mozilla.org/en-US/docs/Web/API/FormData"
        target="_blank"
        rel="noopener noreferrer">浏览器等效对象</a
    >
    相同的 API，主要区别在于文件值部分，<code>Blob</code> 替换为
    <a href="/jsvm/modules/_filesystem.html" target="_blank" rel="noopener noreferrer"
        ><code>$filesystem.File</code></a
    >。
</p>
<CodeBlock
    language="javascript"
    content={`
        const formData = new FormData();

        formData.append("title", "Hello world!")
        formData.append("documents", $filesystem.fileFromBytes("doc1", "doc1.txt"))
        formData.append("documents", $filesystem.fileFromBytes("doc2", "doc2.txt"))

        const res = $http.send({
            url:    "https://...",
            method: "POST",
            body:   formData,
        })

        console.log(res.statusCode)
    `}
/>

<HeadingLink title="限制" />
<p>
    目前尚不支持流式响应或服务器推送事件（SSE）。
    <code>$http.send</code> 调用会阻塞并一次性返回完整响应体。
</p>
<p>
    如需此类或其他更高级的用例，你需要
    <a href="/docs/go-overview/">通过 Go 扩展 PocketBase</a>。
</p>
