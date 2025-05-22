<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
</script>

<p>
    你可以使用 <code>app.rootCmd.addCommand(cmd)</code> 注册自定义控制台命令，其中 <code>cmd</code> 是一个
    <a href="/jsvm/classes/Command.html" target="_blank" rel="noopener noreferrer">Command</a> 实例。
</p>

<p>示例：</p>
<CodeBlock
    language="go"
    content={`
        $app.rootCmd.addCommand(new Command({
            use: "hello",
            run: (cmd, args) => {
                console.log("Hello world!")
            },
        }))
    `}
/>

<p>要运行该命令，你可以执行：</p>
<CodeBlock
    language="html"
    content={`
        ./pocketbase hello
    `}
/>

<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            请注意，控制台命令会在各自独立的应用进程中执行，并且与主 <code>serve</code> 命令相互独立（即不同进程之间的 hook 事件不会相互共享）。
        </p>
    </div>
</div>
