<script>
    import CodeTabs from "@/components/CodeTabs.svelte";
    import { extendGroup } from "@/stores/preferences";
</script>

<p>
    PocketBase 的主要特性之一是
    <strong>它可以作为一个框架使用</strong>，这使你能够用
    <a href="/docs/go-overview">Go</a> 或 <a href="/docs/js-overview">JavaScript</a> 编写自定义的应用业务逻辑，并最终拥有一个可移植的后端。
</p>

<p>
    <strong>
        如果你已经熟悉 Go 语言或有时间学习，建议选择 <a href="/docs/go-overview" class="label label-info">使用 Go 扩展</a>。
    </strong>
    作为 PocketBase 的主要语言，Go API 文档更加完善，并且你可以集成任何第三方 Go 库，拥有更多对应用流程的控制。唯一的缺点是 Go API 稍显繁琐，尤其是第一次接触 Go 时，可能需要一些时间适应。
</p>

<p>
    <strong>
        如果你不打算编写太多自定义代码，想要快速体验 PocketBase 的功能，建议选择 <a href="/docs/js-overview" class="label label-warning">使用 JavaScript 扩展</a>。
    </strong>
    内置的 JavaScript 引擎是对现有 Go API 的可插拔封装，大多数情况下轻微的性能损耗可以忽略，因为底层会调用 Go 函数。
    <br />
    另外，由于 JS 虚拟机与 Go API 保持一致，后续如遇到瓶颈或需要更高的控制权时，可以平滑地将代码从 JS 迁移到 Go，几乎无需修改代码。
</p>

<p>无论使用 Go 还是 JavaScript，你都可以：</p>
<ul>
    <li class="m-b-sm">
        <strong>注册自定义路由：</strong>
        <CodeTabs
            group={extendGroup}
            go={`
                app.OnServe().BindFunc(func(se *core.ServeEvent) error {
                    se.Router.GET("/hello", func(e *core.RequestEvent) error {
                        return e.String(http.StatusOK, "Hello world!")
                    })

                    return se.Next()
                })
            `}
            js={`
                routerAdd("GET", "/hello", (e) => {
                    return e.string(200, "Hello world!")
                })
            `}
        />
    </li>
    <li class="m-b-sm">
        <strong>绑定事件钩子并拦截响应：</strong>
        <CodeTabs
            group={extendGroup}
            go={`
                app.OnRecordCreateRequest("posts").BindFunc(func(e *core.RecordRequestEvent) error {
                    // if not superuser, overwrite the newly submitted "posts" record status to pending
                    if !e.HasSuperuserAuth() {
                        e.Record.Set("status", "pending")
                    }

                    return e.Next()
                })
            `}
            js={`
                onRecordCreateRequest((e) => {
                    // if not superuser, overwrite the newly submitted "posts" record status to pending
                    if (!e.hasSuperuserAuth()) {
                        e.record.set("status", "pending")
                    }

                    e.next()
                }, "posts")
            `}
        />
    </li>
    <li class="m-b-sm">
        <strong>注册自定义控制台命令：</strong>
        <CodeTabs
            group={extendGroup}
            go={`
                app.RootCmd.AddCommand(&cobra.Command{
                    Use: "hello",
                    Run: func(cmd *cobra.Command, args []string) {
                        print("Hello world!")
                    },
                })
            `}
            js={`
                $app.rootCmd.addCommand(new Command({
                    use: "hello",
                    run: (cmd, args) => {
                        console.log("Hello world!")
                    },
                }))
            `}
        />
    </li>
    <li>以及更多功能……</li>
</ul>

<p class="m-t-base">
    更多信息请参考相关的 <a href="/docs/go-overview">使用 Go 扩展</a> 或
    <a href="/docs/js-overview">使用 JavaScript 扩展</a> 指南。
</p>
