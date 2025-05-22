<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import LogsWriteAlert from "../go-logging/LogsWriteAlert.svelte";
    import LogsSettingsSection from "../go-logging/LogsSettingsSection.svelte";
</script>

<p>
    <code>$app.logger()</code> 可用于将任何日志写入数据库，以便之后可以在 PocketBase <em>Dashboard > Logs</em> 部分进行查看。
</p>

<LogsWriteAlert />

<Toc />

<HeadingLink title="日志方法" />
<p>
    所有标准
    <a href="/jsvm/interfaces/slog.Logger.html" target="_blank" rel="noopener noreferrer">
        <code>slog.Logger</code>
    </a>
    方法都可用，下面列出了一些最常用的方法。请注意，属性以键值对参数的形式表示。
</p>

<HeadingLink title="debug(message, attrs...)" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        $app.logger().debug("Debug message!")

        $app.logger().debug(
            "Debug message with attributes!",
            "name", "John Doe",
            "id", 123,
        )
    `}
/>

<HeadingLink title="info(message, attrs...)" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        $app.logger().info("Info message!")

        $app.logger().info(
            "Info message with attributes!",
            "name", "John Doe",
            "id", 123,
        )
    `}
/>

<HeadingLink title="warn(message, attrs...)" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        $app.logger().warn("Warning message!")

        $app.logger().warn(
            "Warning message with attributes!",
            "name", "John Doe",
            "id", 123,
        )
    `}
/>

<HeadingLink title="error(message, attrs...)" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        $app.logger().error("Error message!")

        $app.logger().error(
            "Error message with attributes!",
            "id", 123,
            "error", err,
        )
    `}
/>

<HeadingLink title="with(attrs...)" tag="h5" />
<p>
    <code>with(atrs...)</code> 会创建一个新的本地 logger，并在之后的每条日志中“注入”指定的属性。
</p>
<CodeBlock
    language="javascript"
    content={`
        const l = $app.logger().with("total", 123)

        // results in log with data {"total": 123}
        l.info("message A")

        // results in log with data {"total": 123, "name": "john"}
        l.info("message B", "name", "john")
    `}
/>

<HeadingLink title="withGroup(name)" tag="h5" />
<p>
    <code>withGroup(name)</code> 会创建一个新的本地 logger，将所有日志属性包裹在指定的分组名下。
</p>
<CodeBlock
    language="javascript"
    content={`
        const l = $app.logger().withGroup("sub")

        // results in log with data {"sub": { "total": 123 }}
        l.info("message A", "total", 123)
    `}
/>

<LogsSettingsSection />

<HeadingLink title="自定义日志查询" />
<p>
    日志通常建议通过界面进行筛选，但如果你希望以编程方式获取和筛选已存储的日志，可以使用
    <a href="/jsvm/functions/_app.logQuery.html" target="_blank" rel="noopener noreferrer">
        <code>$app.logQuery()</code>
    </a> 查询构建方法。例如：
</p>
<CodeBlock
    language="javascript"
    content={`
        let logs = arrayOf(new DynamicModel({
            id:      "",
            created: "",
            message: "",
            level:   0,
            data:    {},
        }))

        // see https://pocketbase.io/docs/js-database/#query-builder
        $app.logQuery().
            // target only debug and info logs
            andWhere($dbx.in("level", -4, 0)).
            // the data column is serialized json object and could be anything
            andWhere($dbx.exp("json_extract(data, '$.type') = 'request'")).
            orderBy("created DESC").
            limit(100).
            all(logs)
    `}
/>

