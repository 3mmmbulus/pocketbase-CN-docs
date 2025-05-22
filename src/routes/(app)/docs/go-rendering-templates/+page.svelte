<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import HeadingLink from "@/components/HeadingLink.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<Toc />

<HeadingLink title="概述" />
<p>在创建自定义路由或邮件时，一个常见的任务就是生成 HTML 输出。</p>
<p>
    有许多可用的 Go 模板引擎可以用于此目的，但对于简单场景，Go 标准库中的 <code>html/template</code> 包通常已经足够。
</p>
<p>
    为了让你可以更方便地并发和动态加载模板文件，PocketBase 还在标准库的基础上提供了一个轻量级封装，位于
    <a href="{import.meta.env.PB_GODOC_URL}/tools/template" target="_blank" rel="noopener noreferrer">
        <code>github.com/pocketbase/pocketbase/tools/template</code>
    </a>
    工具包中。
</p>
<CodeBlock
    language="go"
    content={`
        import "github.com/pocketbase/pocketbase/tools/template"

        data := map[string]any{"name": "John"}

        html, err := template.NewRegistry().LoadFiles(
            "views/base.html",
            "views/partial1.html",
            "views/partial2.html",
        ).Render(data)
    `}
/>
<p>
    当你使用组合和嵌套模板时，一般流程是先创建“基础”模板，使用
    <code>{`{{template "placeholderName" .}}`}</code> 或
    <code>{`{{block "placeholderName" .}}default...{{end}}`}</code> 动作定义各种占位符。
</p>
<p>
    然后在分部模板中，使用
    <code>{`{{define "placeholderName"}}custom...{{end}}`}</code> 动作为这些占位符定义内容。
</p>
<p>
    上述中的点对象（<code class="txt-bold">.</code>）代表通过 <code>Render(data)</code> 方法传递给模板的数据。
</p>
<p>
    默认情况下，模板会自动应用上下文相关（HTML、JS、CSS、URI）的转义，因此生成的模板内容应当是安全的。若要在模板中渲染原始/可信内容，可以使用内置的 <code>raw</code> 函数（如 <code>{`{{.content|raw}}`}</code>）。
</p>

<div class="alert alert-info m-t-10 m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            有关模板语法的更多信息，请参考
            <a
                href="https://pkg.go.dev/html/template#hdr-A_fuller_picture"
                target="_blank"
                rel="noopener noreferrer"
            >
                <em>html/template</em>
            </a>
            和
            <a href="https://pkg.go.dev/text/template" target="_blank" rel="noopener noreferrer">
                <em>text/template</em>
            </a>
            包的官方文档。
            <strong>
                另一个很好的学习资源是 Hashicorp 的
                <a
                    href="https://developer.hashicorp.com/nomad/tutorials/templates/go-template-syntax"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn Go Template Syntax
                </a>
                教程。
            </strong>
        </p>
    </div>
</div>

<HeadingLink title="带布局的 HTML 页面示例" />
<p>请参考以下应用目录结构：</p>
<CodeBlock
    language="html"
    content={`
        myapp/
            views/
                layout.html
                hello.html
            main.go
    `}
/>

<p>我们为 <code>layout.html</code> 定义的内容如下：</p>
<CodeBlock
    language="html"
    content={`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>{{block "title" .}}Default app title{{end}}</title>
        </head>
        <body>
            Header...

            {{block "body" .}}
                Default app body...
            {{end}}

            Footer...
        </body>
        </html>
    `}
/>

<p>我们为 <code>hello.html</code> 定义的内容如下：</p>
<CodeBlock
    language="html"
    content={`
        {{define "title"}}
            Page 1
        {{end}}

        {{define "body"}}
            <p>Hello from {{.name}}</p>
        {{end}}
    `}
/>

<p>然后，为了输出最终页面，我们将注册一个自定义 <code>/hello/:name</code> 路由：</p>
<CodeBlock
    language="go"
    content={`
        // main.go
        package main

        import (
            "log"
            "net/http"

            "github.com/pocketbase/pocketbase"
            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tools/template"
        )

        func main() {
            app := pocketbase.New()

            app.OnServe().BindFunc(func(se *core.ServeEvent) error {
                // this is safe to be used by multiple goroutines
                // (it acts as store for the parsed templates)
                registry := template.NewRegistry()

                se.Router.GET("/hello/{name}", func(e *core.RequestEvent) error {
                    name := e.Request.PathValue("name")

                    html, err := registry.LoadFiles(
                        "views/layout.html",
                        "views/hello.html",
                    ).Render(map[string]any{
                        "name": name,
                    })

                    if err != nil {
                        // or redirect to a dedicated 404 HTML page
                        return e.NotFoundError("", err)
                    }

                    return e.HTML(http.StatusOK, html)
                })

                return se.Next()
            })

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>
