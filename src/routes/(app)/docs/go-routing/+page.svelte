<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import HeadingLink from "@/components/HeadingLink.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<p>
    PocketBase 路由基于标准 Go
    <!-- prettier-ignore -->
    <a href="https://pkg.go.dev/net/http#ServeMux" target="_blank" rel="noopener noreferrer"><code>net/http.ServeMux</code></a> 构建。
    你可以通过 <code>app.OnServe()</code> 钩子访问路由器，从而注册自定义端点和中间件。
</p>

<Toc />

<HeadingLink title="路由" />

<HeadingLink title="注册新路由" tag="h5" />
<p>每个路由都有路径、处理函数以及可选的中间件。例如：</p>
<CodeBlock
    language="go"
    content={`
        app.OnServe().BindFunc(func(se *core.ServeEvent) error {
            // register "GET /hello/{name}" route (allowed for everyone)
            se.Router.GET("/hello/{name}", func(e *core.RequestEvent) error {
                name := e.Request.PathValue("name")

                return e.String(http.StatusOK, "Hello " + name)
            })

            // register "POST /api/myapp/settings" route (allowed only for authenticated users)
            se.Router.POST("/api/myapp/settings", func(e *core.RequestEvent) error {
                // do something ...
                return e.JSON(http.StatusOK, map[string]bool{"success": true})
            }).Bind(apis.RequireAuth())

            return se.Next()
        })
    `}
/>

<p>有多种路由注册方法可用，但最常用的是：</p>
<CodeBlock
    language="go"
    content={`
        se.Router.GET(path, action)
        se.Router.POST(path, action)
        se.Router.PUT(path, action)
        se.Router.PATCH(path, action)
        se.Router.DELETE(path, action)

        // If you want to handle any HTTP method define only a path (e.g. "/example")
        // OR if you want to specify a custom one add it as prefix to the path (e.g. "TRACE /example")
        se.Router.Any(pattern, action)
    `}
/>

<p>
    路由器还支持为具有相同基础路径和中间件的路由创建分组。例如：
</p>
<div class="grid">
    <div class="col-6">
        <CodeBlock
            language="go"
            content={`
                g := se.Router.Group("/api/myapp")

                // group middleware
                g.Bind(apis.RequireAuth())

                // group routes
                g.GET("", action1)
                g.GET("/example/{id}", action2)
                g.PATCH("/example/{id}", action3).BindFunc(
                    /* custom route specific middleware func */
                )

                // nested group
                sub := g.Group("/sub")
                sub.GET("/sub1", action4)
            `}
        />
    </div>
    <div class="col-6">
        <p>
            该示例注册了以下端点
            <br />
            （全部需要认证用户访问）：
        </p>
        <ul>
            <li>GET /api/myapp -> action1</li>
            <li>GET /api/myapp/example/{`{id}`} -> action2</li>
            <li>PATCH /api/myapp/example/{`{id}`} -> action3</li>
            <li>GET /api/myapp/example/sub/sub1 -> action4</li>
        </ul>
    </div>
</div>
<p>
    每个路由分组和路由都可以通过 <code>Bind/BindFunc</code> 方法定义<a href="#middlewares">中间件</a>，用法与常规 app 钩子类似，可用于执行各种前置或后置操作（如检查请求头、自定义访问校验等）。
</p>

<HeadingLink title="路径参数与匹配规则" tag="h5" />
<p>
    由于 PocketBase 路由基于 Go 标准路由器 mux，我们遵循相同的模式匹配规则。下面是简要说明，更多细节请参考
    <!-- prettier-ignore -->
    <a href="https://pkg.go.dev/net/http#ServeMux" target="_blank" rel="noopener noreferrer"><code>net/http.ServeMux</code></a>。
</p>
<p>
    通常，路由模式格式为 <code>[METHOD ][HOST]/[PATH]</code>
    （<em
        >使用 <code>GET()</code>、<code>POST()</code> 等方法时，METHOD 前缀会自动添加</em
    >）。
</p>
<p>
    路由路径可包含 <code>{`{paramName}`}</code> 格式的参数。
    <br />
    你也可以使用 <code>{`{paramName...}`}</code> 格式指定匹配多个路径段的参数。
</p>
<p class="txt-bold">
    以斜杠 <code>/</code> 结尾的模式会作为匿名通配符，匹配所有以该路由开头的请求。如果你想要斜杠结尾但表示 URL 结束，需要以特殊参数 <code>{`{$}`}</code> 结尾。
</p>
<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            如果你的路由路径以 <code>/api/</code> 开头，建议结合你的唯一应用名（如 <code>/api/myapp/...</code>）以避免与系统路由冲突。
        </p>
    </div>
</div>
<p>以下是一些示例：</p>
<CodeBlock
    language="go"
    content={`
        // match "GET example.com/index.html"
        se.Router.GET("example.com/index.html")

        // match "GET /index.html" (for any host)
        se.Router.GET("/index.html")

        // match "GET /static/", "GET /static/a/b/c", etc.
        se.Router.GET("/static/")

        // match "GET /static/", "GET /static/a/b/c", etc.
        // (similar to the above but with a named wildcard parameter)
        se.Router.GET("/static/{path...}")

        // match only "GET /static/" (if no "/static" is registered, it is 301 redirected)
        se.Router.GET("/static/{$}")

        // match "GET /customers/john", "GET /customer/jane", etc.
        se.Router.GET("/customers/{name}")
    `}
/>

<hr />

<center class="txt-hint">
    <p>
        下列示例中的 <code>e</code> 通常是
        <a href="{import.meta.env.PB_GODOC_URL}/core#RequestEvent" target="_blank" rel="noopener noreferrer">
            <code>*core.RequestEvent</code>
        </a> 类型的值。
    </p>
</center>

<hr />

<HeadingLink title="读取路径参数" tag="h5" />
<CodeBlock language="go" content={`id := e.Request.PathValue("id")`} />

<HeadingLink title="获取当前认证状态" tag="h5" />
<p>
    请求认证状态可通过 <code>RequestEvent.Auth</code> 字段访问（或设置）。
</p>
<CodeBlock
    language="go"
    content={`
        authRecord := e.Auth

        isGuest := e.Auth == nil

        // the same as "e.Auth != nil && e.Auth.IsSuperuser()"
        isSuperuser := e.HasSuperuserAuth()
    `}
/>
<p>
    你也可以通过汇总的请求信息实例访问请求数据
    <em>
        （通常用于如 <code>OnRecordEnrich</code> 这类没有直接请求访问权限的钩子中）
    </em>。
</p>
<CodeBlock
    language="go"
    content={`
        info, err := e.RequestInfo()

        authRecord := info.Auth

        isGuest := info.Auth == nil

        // the same as "info.Auth != nil && info.Auth.IsSuperuser()"
        isSuperuser := info.HasSuperuserAuth()
    `}
/>

<HeadingLink title="读取查询参数" tag="h5" />
<CodeBlock
    language="go"
    content={`
        search := e.Request.URL.Query().Get("search")

        // or via the parsed request info
        info, err := e.RequestInfo()
        search := info.Query["search"]
    `}
/>

<HeadingLink title="读取请求头" tag="h5" />
<CodeBlock
    language="go"
    content={`
        token := e.Request.Header.Get("Some-Header")

        // or via the parsed request info
        // (the header value is always normalized per the @request.headers.* API rules format)
        info, err := e.RequestInfo()
        token := info.Headers["some_header"]
    `}
/>

<HeadingLink title="写入响应头" tag="h5" />
<CodeBlock language="go" content={`e.Response.Header().Set("Some-Header", "123")`} />

<HeadingLink title="获取上传文件" tag="h5" />
<CodeBlock
    language="go"
    content={`
        // retrieve the uploaded files and parse the found multipart data into a ready-to-use []*filesystem.File
        files, err := e.FindUploadedFiles("document")

        // or retrieve the raw single multipart/form-data file and header
        mf, mh, err := e.Request.FormFile("document")
    `}
/>

<HeadingLink title="读取请求体" tag="h5" />
<p>
    请求体参数可以通过
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/router#Event.BindBody"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>e.BindBody</code>
    </a>
    或解析后的请求信息读取（<em>需要手动类型断言</em>）。
</p>
<p>
    <code>e.BindBody</code> 的参数必须是结构体指针或 <code>map[string]any</code>。
    <br />
    支持以下结构体标签
    <em>（具体绑定规则及使用哪种取决于请求 Content-Type）</em>：
</p>
<ul>
    <li><code>json</code>（json body）- 使用 Go 内置 JSON 包解析。</li>
    <li><code>xml</code>（xml body）- 使用 Go 内置 XML 包解析。</li>
    <li>
        <code>form</code>（表单数据）- 使用自定义
        <a
            href="{import.meta.env.PB_GODOC_URL}/tools/router#UnmarshalRequestData"
            target="_blank"
            rel="noopener noreferrer"
        >
            <code>router.UnmarshalRequestData</code>
        </a>
        方法。
    </li>
</ul>
<p class="txt-bold">
    注意！绑定结构体时请确保没有不应被绑定的公有字段，建议将此类字段设为私有，或单独定义仅包含安全字段的结构体。
</p>
<!-- prettier-ignore -->
<CodeBlock
    language="go"
    content={`
        // read/scan the request body fields into a typed struct
        data := struct {
            // unexported to prevent binding
            somethingPrivate string

            Title       string ` + "`" + `json:"title" form:"title"` + "`" + `
            Description string ` + "`" + `json:"description" form:"description"` + "`" + `
            Active      bool   ` + "`" + `json:"active" form:"active"` + "`" + `
        }{}
        if err := e.BindBody(&data); err != nil {
            return e.BadRequestError("Failed to read request data", err)
        }

        // alternatively, read the body via the parsed request info
        info, err := e.RequestInfo()
        title, ok := info.Body["title"].(string)
    `}
/>

<HeadingLink title="写入响应体" tag="h5" />
<p>
    <em>
        所有支持的方法可参考
        <a href="{import.meta.env.PB_GODOC_URL}/tools/router#Event" target="_blank" rel="noopener noreferrer">
            <code>router.Event</code>
        </a>
        。
    </em>
</p>
<CodeBlock
    language="go"
    content={`
        // send response with JSON body
        // (it also provides a generic response fields picker/filter if the "fields" query parameter is set)
        e.JSON(http.StatusOK, map[string]any{"name": "John"})

        // send response with string body
        e.String(http.StatusOK, "Lorem ipsum...")

        // send response with HTML body
        // (check also the "Rendering templates" section)
        e.HTML(http.StatusOK, "<h1>Hello!</h1>")

        // redirect
        e.Redirect(http.StatusTemporaryRedirect, "https://example.com")

        // send response with no body
        e.NoContent(http.StatusNoContent)

        // serve a single file
        e.FileFS(os.DirFS("..."), "example.txt")

        // stream the specified reader
        e.Stream(http.StatusOK, "application/octet-stream", reader)

        // send response with blob (bytes slice) body
        e.Blob(http.StatusOK, "application/octet-stream", []byte{ ... })
    `}
/>

<HeadingLink title="读取客户端 IP" tag="h5" />
<!-- prettier-ignore -->
<CodeBlock
    language="go"
    content={`
        // The IP of the last client connecting to your server.
        // The returned IP is safe and can be always trusted.
        // When behind a reverse proxy (e.g. nginx) this method returns the IP of the proxy.
        // ` + import.meta.env.PB_GODOC_URL + `/tools/router#Event.RemoteIP
        ip := e.RemoteIP()

        // The "real" IP of the client based on the configured Settings.TrustedProxy header(s).
        // If such headers are not set, it fallbacks to e.RemoteIP().
        // ` + import.meta.env.PB_GODOC_URL + `/core#RequestEvent.RealIP
        ip := e.RealIP()
    `}
/>

<HeadingLink title="请求存储" tag="h5" />
<p>
    <code>core.RequestEvent</code> 自带本地存储，你可以用它在<a href="#middlewares">中间件</a>和路由处理函数之间共享自定义数据。
</p>
<CodeBlock
    language="go"
    content={`
        // store for the duration of the request
        e.Set("someKey", 123)

        // retrieve later
        val := e.Get("someKey").(int) // 123
    `}
/>

<HeadingLink title="中间件" />

<HeadingLink title="注册中间件" tag="h5" />
<p>中间件允许你检查、拦截和过滤路由请求。</p>
<p>
    所有中间件函数与路由处理函数签名一致（即 <code>{`func(e *core.RequestEvent) error`}</code>），但需要调用 <code>e.Next()</code> 以继续执行链。
</p>
<p>
    中间件可通过 <code>Bind</code> 和 <code>BindFunc</code> 方法在<em>全局</em>、<em>分组</em>或<em>路由</em>级别注册。
</p>
<p>下面是一个全局中间件的最小示例：</p>
<CodeBlock
    language="go"
    content={`
        app.OnServe().BindFunc(func(se *core.ServeEvent) error {
            // register a global middleware
            se.Router.BindFunc(func(e *core.RequestEvent) error {
                if e.Request.Header.Get("Something") == "" {
                    return e.BadRequestError("Something header value is missing!", nil)
                }
                return e.Next()
            })

            return se.Next()
        })
    `}
/>
<p>
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/router#RouterGroup.Bind"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>RouterGroup.Bind(middlewares...)</code>
    </a>
    /
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/router#Route.Bind"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>Route.Bind(middlewares...)</code>
    </a>
    可注册一个或多个中间件处理器。
    <br />
    与其他 app 钩子类似，中间件处理器有 3 个字段：
</p>
<ul>
    <li>
        <code>Id</code> <em>（可选）</em> - 中间件名称（可用于 <code>Unbind</code> 参数）
    </li>
    <li>
        <code>Priority</code> <em>（可选）</em> - 中间件执行顺序（为空时按代码注册顺序）
    </li>
    <li><code>Func</code> <em>（必填）</em> - 中间件处理函数</li>
</ul>
<p>
    通常你无需指定 <code>Id</code> 或 <code>Priority</code>，可直接使用
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/router#RouterGroup.BindFunc"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>RouterGroup.BindFunc(funcs...)</code>
    </a>
    /
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/router#Route.BindFunc"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>Route.BindFunc(funcs...)</code>
    </a> 进行注册。
</p>
<p>
    下面是一个更高级的示例，展示所有选项及执行顺序（<em>2,0,1,3,4</em>）：
</p>
<CodeBlock
    language="go"
    content={`
        app.OnServe().BindFunc(func(se *core.ServeEvent) error {
            // attach global middleware
            se.Router.BindFunc(func(e *core.RequestEvent) error {
                println(0)
                return e.Next()
            })

            g := se.Router.Group("/sub")

            // attach group middleware
            g.BindFunc(func(e *core.RequestEvent) error {
                println(1)
                return e.Next()
            })

            // attach group middleware with an id and custom priority
            g.Bind(&hook.Handler[*core.RequestEvent]{
                Id: "something",
                Func: func(e *core.RequestEvent) error {
                    println(2)
                    return e.Next()
                },
                Priority: -1,
            })

            // attach middleware to a single route
            //
            // "GET /sub/hello" should print the sequence: 2,0,1,3,4
            g.GET("/hello", func(e *core.RequestEvent) error {
                println(4)
                return e.String(200, "Hello!")
            }).BindFunc(func(e *core.RequestEvent) error {
                println(3)
                return e.Next()
            })

            return se.Next()
        })
    `}
/>

<HeadingLink title="移除中间件" tag="h5" />
<p>
    若要从某个分组或路由的执行链中移除已注册的中间件，可使用 <code>Unbind(id)</code> 方法。
</p>
<p>注意：只有具有非空 <code>Id</code> 的中间件才能被移除。</p>
<CodeBlock
    language="go"
    content={`
        app.OnServe().BindFunc(func(se *core.ServeEvent) error {
            // global middleware
            se.Router.Bind(&hook.Handler[*core.RequestEvent]{
                Id: "test",
                Func: func(e *core.RequestEvent) error {
                    // ...
                    return e.Next()
                },
            )

            // "GET /A" invokes the "test" middleware
            se.Router.GET("/A", func(e *core.RequestEvent) error {
                return e.String(200, "A")
            })

            // "GET /B" doesn't invoke the "test" middleware
            se.Router.GET("/B", func(e *core.RequestEvent) error {
                return e.String(200, "B")
            }).Unbind("test")

            return se.Next()
        })
    `}
/>

<HeadingLink title="内置中间件" tag="h5" />
<p>
    <a href="{import.meta.env.PB_GODOC_URL}/apis" target="_blank" rel="noopener noreferrer">
        <code>apis</code>
    </a>
    包提供了多种可用于应用的中间件。
</p>
<CodeBlock
    language="go"
    content={`
        // Require the request client to be unauthenticated (aka. guest).
        // Example: Route.Bind(apis.RequireGuestOnly())
        apis.RequireGuestOnly()

        // Require the request client to be authenticated
        // (optionally specify a list of allowed auth collection names, default to any).
        // Example: Route.Bind(apis.RequireAuth())
        apis.RequireAuth(optCollectionNames...)

        // Require the request client to be authenticated as superuser
        // (this is an alias for apis.RequireAuth(core.CollectionNameSuperusers)).
        // Example: Route.Bind(apis.RequireSuperuserAuth())
        apis.RequireSuperuserAuth()

        // Require the request client to be authenticated as superuser OR
        // regular auth record with id matching the specified route parameter (default to "id").
        // Example: Route.Bind(apis.RequireSuperuserOrOwnerAuth(""))
        apis.RequireSuperuserOrOwnerAuth(ownerIdParam)

        // Changes the global 32MB default request body size limit (set it to 0 for no limit).
        // Note that system record routes have dynamic body size limit based on their collection field types.
        // Example: Route.Bind(apis.BodyLimit(10 << 20))
        apis.BodyLimit(limitBytes)

        // Compresses the HTTP response using Gzip compression scheme.
        // Example: Route.Bind(apis.Gzip())
        apis.Gzip()

        // Instructs the activity logger to log only requests that have failed/returned an error.
        // Example: Route.Bind(apis.SkipSuccessActivityLog())
        apis.SkipSuccessActivityLog()
    `}
/>

<HeadingLink title="默认全局注册中间件" tag="h5" />
<small class="txt-hint">
    下方列表主要用于希望在默认全局中间件优先级之前/之后插入自定义中间件的用户，例如：在限流器之前注册自定义认证加载器（<code>apis.DefaultRateLimitMiddlewarePriority - 1</code>），以便限流能基于已加载的认证状态正确应用。
</small>
<p>
    所有 PocketBase 应用默认注册了以下内部中间件（<em>按优先级排序</em>）：
    <br />
</p>
<ul>
    <li>
        <strong>WWW 重定向</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultWWWRedirectMiddlewareId</code>
            </a>
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultWWWRedirectMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em>
            如果请求主机与证书主机策略中的某个值匹配，则执行 www -> 非 www 重定向。
        </em>
    </li>
    <li>
        <strong>CORS</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultCorsMiddlewareId</code>
            </a>
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultCorsMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em>
            默认允许所有来源（PocketBase 是无状态的且不依赖 cookie），可通过 <code>--origins</code> 参数配置。如需更高级自定义，可用 <code>apis.CORS(config)</code> 中间件替换，或注册自定义中间件。
        </em>
    </li>
    <li>
        <strong>活动日志记录器</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultActivityLoggerMiddlewareId</code>
            </a>

            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultActivityLoggerMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em>将请求信息保存到日志辅助数据库。</em>
    </li>
    <li>
        <strong>自动 panic 恢复</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultPanicRecoverMiddlewareId</code>
            </a>
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultPanicRecoverMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em>默认 panic 恢复处理器。</em>
    </li>
    <li>
        <strong>认证令牌加载器</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultLoadAuthTokenMiddlewareId</code>
            </a>
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultLoadAuthTokenMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em>
            从 <code>Authorization</code> 请求头加载认证令牌，并将相关认证记录填充到请求事件（即 <code>e.Auth</code>）。
        </em>
    </li>
    <li>
        <strong>安全响应头</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultSecurityHeadersMiddlewareId</code>
            </a>
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultSecurityHeadersMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em>
            为响应添加默认常用安全头（<code>X-XSS-Protection</code>、<code>X-Content-Type-Options</code>、<code>X-Frame-Options</code>），可被其他中间件或路由处理函数覆盖。
        </em>
    </li>
    <li>
        <strong>限流</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultRateLimitMiddlewareId</code>
            </a>
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultRateLimitMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em
            >根据应用设置对客户端请求进行限流（如未启用限流选项则无效）。</em
        >
    </li>
    <li>
        <strong>请求体大小限制</strong>
        <small class="txt-hint">
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultBodyLimitMiddlewareId</code>
            </a>
            <a
                href="{import.meta.env.PB_GODOC_URL}/apis#pkg-constants"
                target="_blank"
                rel="noopener noreferrer"
            >
                <code>apis.DefaultBodyLimitMiddlewarePriority</code>
            </a>
        </small>
        <br />
        <em>
            为所有自定义路由应用默认最大约 32MB 的请求体大小限制（系统记录路由根据集合字段类型动态调整）。可通过在分组/路由级别重新绑定 <code>apis.BodyLimit(limitBytes)</code> 中间件覆盖。
        </em>
    </li>
</ul>

<HeadingLink title="错误响应" />
<p>
    PocketBase 拥有全局错误处理器，路由或中间件返回的任何错误都会被安全地转换为通用 <code>ApiError</code>，以避免意外泄露敏感信息（原始错误信息仅在<em>仪表盘 > 日志</em>或 <code>--dev</code> 模式下可见）。
</p>
<p>
    为方便返回格式化的 JSON 错误响应，请求事件提供了多种 <code>ApiError</code> 方法。
    <br />
    注意：<code>ApiError.RawData()</code> 仅在其为 <code>router.SafeErrorItem</code>/<code>validation.Error</code> 项的 map 时会返回到响应中。
</p>
<CodeBlock
    language="go"
    content={`
        import validation "github.com/go-ozzo/ozzo-validation/v4"

        se.Router.GET("/example", func(e *core.RequestEvent) error {
            ...

            // construct ApiError with custom status code and validation data error
            return e.Error(500, "something went wrong", map[string]validation.Error{
                "title": validation.NewError("invalid_title", "Invalid or missing title"),
            })

            // if message is empty string, a default one will be set
            return e.BadRequestError(optMessage, optData)      // 400 ApiError
            return e.UnauthorizedError(optMessage, optData)    // 401 ApiError
            return e.ForbiddenError(optMessage, optData)       // 403 ApiError
            return e.NotFoundError(optMessage, optData)        // 404 ApiError
            return e.TooManyRequestsError(optMessage, optData) // 429 ApiError
            return e.InternalServerError(optMessage, optData)  // 500 ApiError
        })
    `}
/>
<p>
    虽然不常见，但如果你希望在请求相关处理器之外返回 <code>ApiError</code>，可使用下方 <code>apis.*</code> 工厂方法：
</p>
<CodeBlock
    language="go"
    content={`
        import (
            validation "github.com/go-ozzo/ozzo-validation/v4"
            "github.com/pocketbase/pocketbase/apis"
        )


        app.OnRecordCreate().BindFunc(func(e *core.RecordEvent) error {
            ...

            // construct ApiError with custom status code and validation data error
            return apis.NewApiError(500, "something went wrong", map[string]validation.Error{
                "title": validation.NewError("invalid_title", "Invalid or missing title"),
            })

            // if message is empty string, a default one will be set
            return apis.NewBadRequestError(optMessage, optData)      // 400 ApiError
            return apis.NewUnauthorizedError(optMessage, optData)    // 401 ApiError
            return apis.NewForbiddenError(optMessage, optData)       // 403 ApiError
            return apis.NewNotFoundError(optMessage, optData)        // 404 ApiError
            return apis.NewTooManyRequestsError(optMessage, optData) // 429 ApiError
            return apis.NewInternalServerError(optMessage, optData)  // 500 ApiError
        })
    `}
/>

<HeadingLink title="辅助方法" />

<HeadingLink title="服务静态目录" tag="h5" />
<p>
    <a href="{import.meta.env.PB_GODOC_URL}/apis#Static" target="_blank" rel="noopener noreferrer">
        <code>apis.Static()</code>
    </a>
    用于从 <code>fs.FS</code> 实例服务静态目录内容。
</p>
<p>要求路由包含 <code>{"{path...}"}</code> 通配符参数。</p>
<CodeBlock
    language="go"
    content={`
        app.OnServe().BindFunc(func(se *core.ServeEvent) error {
            // serves static files from the provided dir (if exists)
            se.Router.GET("/{path...}", apis.Static(os.DirFS("/path/to/public"), false))

            return se.Next()
        })
    `}
/>

<HeadingLink title="认证响应" tag="h5" />
<p>
    <a
        href="{import.meta.env.PB_GODOC_URL}/apis#RecordAuthResponse"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>apis.RecordAuthResponse()</code>
    </a>

    用于向指定请求体写入标准化 JSON 认证响应（即 token + record 数据），可用于自定义认证路由的返回结果。
</p>
<!-- prettier-ignore -->
<CodeBlock
    language="go"
    content={`
        app.OnServe().BindFunc(func(se *core.ServeEvent) error {
            se.Router.POST("/phone-login", func(e *core.RequestEvent) error {
                data := struct {
                    Phone    string `+"`"+`json:"phone" form:"phone"`+"`"+`
                    Password string `+"`"+`json:"password" form:"password"`+"`"+`
                }{}
                if err := e.BindBody(&data); err != nil {
                    return e.BadRequestError("Failed to read request data", err)
                }

                record, err := e.App.FindFirstRecordByData("users", "phone", data.Phone)
                if err != nil || !record.ValidatePassword(data.Password) {
                    // return generic 400 error as a basic enumeration protection
                    return e.BadRequestError("Invalid credentials", err)
                }

                return apis.RecordAuthResponse(e, record, "phone", nil)
            })

            return se.Next()
        })
    `}
/>

<HeadingLink title="丰富记录" tag="h5" />
<p>
    <a href="{import.meta.env.PB_GODOC_URL}/apis#EnrichRecord" target="_blank" rel="noopener noreferrer">
        <code>apis.EnrichRecord()</code>
    </a>
    和
    <a href="{import.meta.env.PB_GODOC_URL}/apis#EnrichRecords" target="_blank" rel="noopener noreferrer">
        <code>apis.EnrichRecords()</code>
    </a>
    辅助方法会解析请求上下文并丰富提供的记录，包括：
</p>
<ul>
    <li>
        扩展关联关系（如设置了 <code>defaultExpands</code> 和/或 <code>?expand</code> 查询参数）
    </li>
    <li>
        确保认证记录及其扩展认证关联的邮箱仅对当前登录超级用户、记录所有者或有管理权限的记录可见
    </li>
</ul>
<CodeBlock
    language="go"
    content={`
        app.OnServe().BindFunc(func(se *core.ServeEvent) error {
            se.Router.GET("/custom-article", func(e *core.RequestEvent) error {
                records, err := e.App.FindRecordsByFilter("article", "status = 'active'", "-created", 40, 0)
                if err != nil {
                    return e.NotFoundError("No active articles", err)
                }

                // enrich the records with the "categories" relation as default expand
                err = apis.EnrichRecords(e, records, "categories")
                if err != nil {
                    return err
                }

                return e.JSON(http.StatusOK, records)
            })

            return se.Next()
        })
    `}
/>

<HeadingLink title="Go http.Handler 封装" tag="h5" />
<p>
    如果你想注册标准 Go <code>http.Handler</code> 函数和中间件，可使用
    <a href="{import.meta.env.PB_GODOC_URL}/apis#WrapStdHandler" target="_blank" rel="noopener noreferrer">
        <code>apis.WrapStdHandler(handler)</code>
    </a>
    和
    <a href="{import.meta.env.PB_GODOC_URL}/apis#WrapStdMiddleware" target="_blank" rel="noopener noreferrer">
        <code>apis.WrapStdMiddleware(func)</code>
    </a>
    方法。
</p>

<HeadingLink title="使用 SDK 向自定义路由发送请求" />
<p>
    官方 PocketBase SDK 提供了内部 <code>send()</code> 方法，可用于向你的自定义路由发送请求。
</p>
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        await pb.send("/hello", {
            // for other options check
            // https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
            query: { "abc": 123 },
        });
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        await pb.send("/hello", query: { "abc": 123 })
    `}
/>

