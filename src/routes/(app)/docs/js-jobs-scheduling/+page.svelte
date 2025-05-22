<script>
    import tooltip from "@/actions/tooltip";
    import CodeBlock from "@/components/CodeBlock.svelte";
</script>

<p>
    如果你有需要定期执行的任务，可以使用
    <code>cronAdd(id, expr, handler)</code> 设置类似 crontab 的定时任务。
</p>

<p>
    每个定时任务都会作为 <code>serve</code> 命令进程的一部分在独立的 goroutine 中运行，并且必须包含：
</p>

<ul>
    <li class="m-0">
        <strong>id</strong> - 定时任务的标识符；可用于替换或移除已存在的任务
    </li>
    <li class="m-0">
        <strong>cron 表达式</strong> - 例如 <code>0 0 * * *</code> (
        <em>
            支持数字列表、步进、范围或
            <span
                class="link-hint"
                use:tooltip={"@yearly\n@annually\n@monthly\n@weekly\n@daily\n@midnight\n@hourly"}>宏</span
            >
        </em>)
    </li>
    <li class="m-0">
        <strong>handler</strong> - 每次任务运行时将被执行的函数
    </li>
</ul>

<p>示例：</p>
<CodeBlock
    language="javascript"
    content={`
        // prints "Hello!" every 2 minutes
        cronAdd("hello", "*/2 * * * *", () => {
            console.log("Hello!")
        })
    `}
/>

<p>如需移除已注册的单个定时任务，可以调用 <code>cronRemove(id)</code>。</p>

<p>
    所有已注册的应用级定时任务也可以在
    <em>{"Dashboard > Settings > Crons"}</em> 页面中预览和手动触发。
</p>
