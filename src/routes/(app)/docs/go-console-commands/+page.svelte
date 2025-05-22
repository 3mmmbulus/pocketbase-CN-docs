<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
</script>

<p>
    你可以使用 <code>app.RootCmd.AddCommand(cmd)</code> 注册自定义控制台命令，其中 <code>cmd</code> 是一个
    <a href="https://pkg.go.dev/github.com/spf13/cobra" target="_blank" rel="noopener noreferrer">cobra</a> 命令。
</p>

<p>以下是一个示例：</p>
<CodeBlock
    language="go"
    content={`
        package main

        import (
            "log"

            "github.com/pocketbase/pocketbase"
            "github.com/spf13/cobra"
        )

        func main() {
            app := pocketbase.New()

            app.RootCmd.AddCommand(&cobra.Command{
                Use: "hello",
                Run: func(cmd *cobra.Command, args []string) {
                    log.Println("Hello world!")
                },
            })

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>

<p>要运行该命令，你可以构建你的 Go 应用并执行：</p>
<CodeBlock
    language="html"
    content={`
        # 或 "go run main.go hello"
        ./myapp hello
    `}
/>

<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            请注意，控制台命令会在各自独立的应用进程中执行，并与主 <code>serve</code> 命令互不影响（即不同进程间的 hook 事件不会共享）。
        </p>
    </div>
</div>
