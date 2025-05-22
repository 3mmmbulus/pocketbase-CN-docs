<script>
    import tooltip from "@/actions/tooltip";
    import CodeBlock from "@/components/CodeBlock.svelte";
</script>

<p>
    如果你有需要定期执行的任务，可以使用内置的 <code>app.Cron()</code> 设置类似 crontab 的定时任务
    <em>
        （它返回一个应用级的
        <a href="{import.meta.env.PB_GODOC_URL}/tools/cron#Cron" target="_blank" rel="noopener noreferrer">
            <code>cron.Cron</code>
        </a> 值）
    </em>
    。
</p>
<p>
    任务调度器会在应用 <code>serve</code> 时自动启动，你只需通过
    <a href="{import.meta.env.PB_GODOC_URL}/tools/cron#Cron.Add" target="_blank" rel="noopener noreferrer">
        <code>app.Cron().Add(id, cronExpr, handler)</code>
    </a>
    或
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/cron#Cron.MustAdd"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.Cron().MustAdd(id, cronExpr, handler)</code>
    </a>
    注册处理函数即可（<em>后者在 cron 表达式无效时会 panic</em>）。
</p>

<p>每个定时任务都会在自己的 goroutine 中运行，并且必须包含：</p>
<ul>
    <li class="m-0">
        <strong>id</strong> - 定时任务的标识符；可用于替换或移除已有任务
    </li>
    <li class="m-0">
        <strong>cron 表达式</strong> - 例如 <code>0 0 * * *</code>（
        <em>
            支持数字列表、步进、范围或
            <span
                class="link-hint"
                use:tooltip={{
                    text: "@yearly\n@annually\n@monthly\n@weekly\n@daily\n@midnight\n@hourly",
                    delay: 0,
                }}
            >
                宏
            </span>
        </em>）
    </li>
    <li class="m-0">
        <strong>handler</strong> - 每次任务运行时会被执行的函数
    </li>
</ul>

<p>下面是一个最简示例：</p>
<CodeBlock
    language="go"
    content={`
        // main.go
        package main

        import (
            "log"

            "github.com/pocketbase/pocketbase"
        )

        func main() {
            app := pocketbase.New()

            // prints "Hello!" every 2 minutes
            app.Cron().MustAdd("hello", "*/2 * * * *", func() {
                log.Println("Hello!")
            })

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>

<p>
    若要移除已注册的定时任务，可以调用
    <a href="{import.meta.env.PB_GODOC_URL}/tools/cron#Cron.Remove" target="_blank" rel="noopener noreferrer">
        <code>app.Cron().Remove(id)</code>
    </a>
</p>

<p>
    所有已注册的应用级定时任务也可以在
    <em>{"Dashboard > Settings > Crons"}</em> 部分预览和手动触发。
</p>

<div class="alert alert-warning">
    <div class="icon">
        <i class="ri-error-warning-line" />
    </div>
    <div class="content">
        <p>
            请注意，<code>app.Cron()</code> 也用于运行系统级定时任务，如日志清理或自动备份（任务 id 格式为 <code>__pb*__</code>），替换这些系统任务或调用 <code>RemoveAll()</code>/<code>Stop()</code> 可能会导致意外后果。
        </p>
        <p>
            如果你需要更高级的控制，可以通过 <code>cron.New()</code> 独立于应用初始化自己的 cron 实例。
        </p>
    </div>
</div>
