<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import LogsWriteAlert from "./LogsWriteAlert.svelte";
    import LogsSettingsSection from "./LogsSettingsSection.svelte";
</script>

<p>
    <code>app.Logger()</code> 提供了一个标准的 <code>slog.Logger</code> 实现，
    可将所有日志写入数据库，便于后续在 PocketBase
    <em>Dashboard > Logs</em> 部分查看。
</p>

<LogsWriteAlert />

<Toc />

<HeadingLink title="日志方法" />
<p>
    所有标准的
    <a href="https://pkg.go.dev/log/slog" target="_blank" rel="noopener noreferrer">
        <code>slog.Logger</code>
    </a>
    方法均可用，以下是一些常用方法的列表。
</p>

<HeadingLink title="Debug(message, attrs...)" tag="h5" />
<CodeBlock
    language="go"
    content={`
        app.Logger().Debug("Debug message!")

        app.Logger().Debug(
            "Debug message with attributes!",
            "name", "John Doe",
            "id", 123,
        )
    `}
/>

<HeadingLink title="Info(message, attrs...)" tag="h5" />
<CodeBlock
    language="go"
    content={`
        app.Logger().Info("Info message!")

        app.Logger().Info(
            "Info message with attributes!",
            "name", "John Doe",
            "id", 123,
        )
    `}
/>

<HeadingLink title="Warn(message, attrs...)" tag="h5" />
<CodeBlock
    language="go"
    content={`
        app.Logger().Warn("Warning message!")

        app.Logger().Warn(
            "Warning message with attributes!",
            "name", "John Doe",
            "id", 123,
        )
    `}
/>

<HeadingLink title="Error(message, attrs...)" tag="h5" />
<CodeBlock
    language="go"
    content={`
        app.Logger().Error("Error message!")

        app.Logger().Error(
            "Error message with attributes!",
            "id", 123,
            "error", err,
        )
    `}
/>

<HeadingLink title="With(attrs...)" tag="h5" />
<p>
    <code>With(atrs...)</code> 会创建一个新的本地 logger，每次日志都会自动“注入”指定的属性。
</p>
<CodeBlock
    language="go"
    content={`
        l := app.Logger().With("total", 123)

        // results in log with data {"total": 123}
        l.Info("message A")

        // results in log with data {"total": 123, "name": "john"}
        l.Info("message B", "name", "john")
    `}
/>

<HeadingLink title="WithGroup(name)" tag="h5" />
<p>
    <code>WithGroup(name)</code> 会创建一个新的本地 logger，将所有日志属性包裹在指定的分组名下。
</p>
<CodeBlock
    language="go"
    content={`
        l := app.Logger().WithGroup("sub")

        // results in log with data {"sub": { "total": 123 }}
        l.Info("message A", "total", 123)
    `}
/>

<LogsSettingsSection />

<HeadingLink title="自定义日志查询" />
<p>
    日志通常建议在界面中筛选，但如果你希望以编程方式获取和筛选已存储的日志，可以使用
    <a href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.LogsQuery" target="_blank" rel="noopener noreferrer">
        <code>app.LogQuery()</code>
    </a> 查询构造器。例如：
</p>
<CodeBlock
    language="go"
    content={`
        logs := []*core.Log{}

        // see https://pocketbase.io/docs/go-database/#query-builder
        err := app.LogQuery().
            // target only debug and info logs
            AndWhere(dbx.In("level", -4, 0).
            // the data column is serialized json object and could be anything
            AndWhere(dbx.NewExp("json_extract(data, '$.type') = 'request'")).
            OrderBy("created DESC").
            Limit(100).
            All(&logs)
    `}
/>
