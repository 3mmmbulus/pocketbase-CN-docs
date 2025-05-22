<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import HeadingLink from "@/components/HeadingLink.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<p>
    你可以通过顶层的
    <a href="/jsvm/functions/routerAdd.html" target="_blank" rel="noopener noreferrer">
        <code>routerAdd()</code>
    </a>
    和
    <a href="/jsvm/functions/routerUse.html" target="_blank" rel="noopener noreferrer">
        <code>routerUse()</code>
    </a>
    函数注册自定义路由和中间件。
</p>

<Toc />

<HeadingLink title="路由" />

<HeadingLink title="注册新路由" tag="h5" />
<p>每个路由都有一个路径、处理函数，并且可以附加中间件。例如：</p>
<CodeBlock
    language="javascript"
    content={`
        // register "GET /hello/{name}" route (allowed for everyone)
        routerAdd("GET", "/hello/{name}", (e) => {
            let name = e.request.pathValue("name")

            return e.json(200, { "message": "Hello " + name })
        })

        // register "POST /api/myapp/settings" route (allowed only for authenticated users)
        routerAdd("POST", "/api/myapp/settings", (e) => {
            // do something ...
            return e.json(200, {"success": true})
        }, $apis.requireAuth())
    `}
/>

<HeadingLink title="路径参数与匹配规则" tag="h5" />
<p>
    由于 PocketBase 路由基于 Go 标准路由 mux，因此遵循相同的模式匹配规则。以下是简要概述，更多细节请参考
    <!-- prettier-ignore -->
    <a href="https://pkg.go.dev/net/http#ServeMux" target="_blank" rel="noopener noreferrer"><code>net/http.ServeMux</code></a>。
</p>
<p>
    通常，路由模式格式为 <code>[METHOD ][HOST]/[PATH]</code>。
</p>
<p>
    路由路径可以包含参数，格式为 <code>{`{paramName}`}</code>。
    <br />
    你也可以使用 <code>{`{paramName...}`}</code> 格式来指定匹配多个路径段的参数。
</p>
<p class="txt-bold">
    以斜杠 <code>/</code> 结尾的模式作为匿名通配符，匹配所有以该路由开头的请求。如果你想要以斜杠结尾但表示 URL 结束，需要以特殊的
    <code>{`{$}`}</code> 参数结尾。
</p>
<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            如果你的路由路径以 <code>/api/</code> 开头，建议结合你的唯一应用名如 <code>/api/myapp/...</code>，以避免与系统路由冲突。
        </p>
    </div>
</div>
<p>以下是一些示例：</p>
<CodeBlock
    language="javascript"
    content={`
        // match "GET example.com/index.html"
       routerAdd("GET", "example.com/index.html", ...)

        // match "GET /index.html" (for any host)
       routerAdd("GET", "/index.html", ...)

        // match "GET /static/", "GET /static/a/b/c", etc.
       routerAdd("GET", "/static/", ...)

        // match "GET /static/", "GET /static/a/b/c", etc.
        // (similar to the above but with a named wildcard parameter)
       routerAdd("GET", "/static/{path...}", ...)

        // match only "GET /static/" (if no "/static" is registered, it is 301 redirected)
       routerAdd("GET", "/static/{$}", ...)

        // match "GET /customers/john", "GET /customer/jane", etc.
       routerAdd("GET", "/customers/{name}", ...)
    `}
/>

<hr />

<center class="txt-hint">
    <p>
        在以下示例中，<code>e</code> 通常是
        <a href="/jsvm/interfaces/core.RequestEvent.html" target="_blank" rel="noopener noreferrer">
            <code>core.RequestEvent</code>
        </a> 值。
    </p>
</center>

<hr />

<HeadingLink title="读取路径参数" tag="h5" />
<CodeBlock language="javascript" content={`let id = e.request.pathValue("id")`} />

<HeadingLink title="获取当前认证状态" tag="h5" />
<p>
    请求认证状态可通过 <code>RequestEvent.auth</code> 字段访问（或设置）。
</p>
<CodeBlock
    language="javascript"
    content={`
        let authRecord = e.auth

        let isGuest = !e.auth

        // the same as "e.auth?.isSuperuser()"
        let isSuperuser = e.hasSuperuserAuth()
    `}
/>
<p>
    你也可以通过汇总的请求信息实例访问请求数据
    <em>
        （通常用于如 <code>onRecordEnrich</code> 这样的 hook，没有直接请求访问权限时）。
    </em>
</p>
<CodeBlock
    language="javascript"
    content={`
        let info = e.requestInfo()

        let authRecord = info.auth

        let isGuest = !info.auth

        // the same as "info.auth?.isSuperuser()"
        let isSuperuser = info.hasSuperuserAuth()
    `}
/>

<HeadingLink title="读取查询参数" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        let search = e.request.url.query().get("search")

        // or via the parsed request info
        let search = e.requestInfo().query["search"]
    `}
/>

<HeadingLink title="读取请求头" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
    let token = e.request.header.get("Some-Header")

    // or via the parsed request info
    // (the header value is always normalized per the @request.headers.* API rules format)
    let token = e.requestInfo().headers["some_header"]
`}
/>

<HeadingLink title="写入响应头" tag="h5" />
<CodeBlock language="javascript" content={`e.response.header().set("Some-Header", "123")`} />

<HeadingLink title="获取上传文件" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        // retrieve the uploaded files and parse the found multipart data into a ready-to-use []*filesystem.File
        let files = e.findUploadedFiles("document")

        // or retrieve the raw single multipart/form-data file and header
        let [mf, mh] = e.request.formFile("document")
    `}
/>

<HeadingLink title="读取请求体" tag="h5" />
<p>
    可以通过
    <a href="/jsvm/interfaces/core.RequestEvent.html#bindBody" target="_blank" rel="noopener noreferrer">
        <code>e.bindBody</code>
    </a>
    或解析后的请求信息读取请求体参数。
</p>
<CodeBlock
    language="javascript"
    content={`
        // read the body via the parsed request object
        let body = e.requestInfo().body
        console.log(body.title)

        // read/scan the request body fields into a typed object
        const data = new DynamicModel({
            // describe the fields to read (used also as initial values)
            someTextField:   "",
            someIntValue:    0,
            someFloatValue:  -0,
            someBoolField:   false,
            someArrayField:  [],
            someObjectField: {}, // object props are accessible via .get(key)
        })
        e.bindBody(data)
        console.log(data.sometextField)
    `}
/>

<HeadingLink title="写入响应体" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        // send response with JSON body
        // (it also provides a generic response fields picker/filter if the "fields" query parameter is set)
        e.json(200, {"name": "John"})

        // send response with string body
        e.string(200, "Lorem ipsum...")

        // send response with HTML body
        // (check also the "Rendering templates" section)
        e.html(200, "<h1>Hello!</h1>")

        // redirect
        e.redirect(307, "https://example.com")

        // send response with no body
        e.noContent(204)

        // serve a single file
        e.fileFS($os.dirFS("..."), "example.txt")

        // stream the specified reader
        e.stream(200, "application/octet-stream", reader)

        // send response with blob (bytes array) body
        e.blob(200, "application/octet-stream", [ ... ])
    `}
/>

<HeadingLink title="读取客户端 IP" tag="h5" />
<!-- prettier-ignore -->
<CodeBlock
    language="javascript"
    content={`
        // The IP of the last client connecting to your server.
        // The returned IP is safe and can be always trusted.
        // When behind a reverse proxy (e.g. nginx) this method returns the IP of the proxy.
        // (/jsvm/interfaces/core.RequestEvent.html#remoteIP)
        let ip = e.remoteIP()

        // The "real" IP of the client based on the configured Settings.trustedProxy header(s).
        // If such headers are not set, it fallbacks to e.remoteIP().
        // (/jsvm/interfaces/core.RequestEvent.html#realIP)
        let ip = e.realIP()
    `}
/>

<HeadingLink title="请求存储" tag="h5" />
<p>
    <code>core.RequestEvent</code> 提供了本地存储，你可以用它在
    <a href="#middlewares">中间件</a> 和路由操作之间共享自定义数据。
</p>
<CodeBlock
    language="javascript"
    content={`
        // store for the duration of the request
        e.set("someKey", 123)

        // retrieve later
        let val = e.get("someKey") // 123
    `}
/>

<HeadingLink title="中间件" />
<p>
    中间件允许检查、拦截和过滤路由请求。
    <br />
    中间件既可以注册到单个路由（作为处理函数后面的参数），也可以通过 <code>routerUse(middleware)</code> 全局注册。
</p>

<HeadingLink title="注册中间件" tag="h5" />
<p>以下是一个全局中间件的最小示例：</p>
<CodeBlock
    language="javascript"
    content={`
        // register a global middleware
        routerUse((e) => {
            if (e.request.header.get("Something") == "") {
                throw new BadRequestError("Something header value is missing!")
            }

            return e.next()
        })
    `}
/>

<p>
    中间件可以注册为简单函数（<code>{`function(e){}`}</code>），如果你想指定自定义优先级和 id，也可以作为
    <a href="/jsvm/classes/Middleware.html" target="_blank" rel="noopener noreferrer">
        <code>Middleware</code>
    </a>
    类实例注册。
</p>

<p>下面是一个更高级的示例，展示了所有选项和执行顺序：</p>
<CodeBlock
    language="javascript"
    content={`
        // attach global middleware
        routerUse((e) => {
            console.log(1)
            return e.next()
        })

        // attach global middleware with a custom priority
        routerUse(new Middleware((e) => {
          console.log(2)
          return e.next()
        }, -1))

        // attach middleware to a single route
        //
        // "GET /hello" should print the sequence: 2,1,3,4
        routerAdd("GET", "/hello", (e) => {
            console.log(4)
            return e.string(200, "Hello!")
        }, (e) => {
            console.log(3)
            return e.next()
        })
    `}
/>

<HeadingLink title="内置中间件" tag="h5" />
<p>
    全局
    <a href="/jsvm/modules/_apis.html" target="_blank" rel="noopener noreferrer">
        <code>$apis.*</code>
    </a>
    对象提供了多种可用于应用的中间件。
</p>
<CodeBlock
    language="javascript"
    content={`
        // Require the request client to be unauthenticated (aka. guest).
        $apis.requireGuestOnly()

        // Require the request client to be authenticated
        // (optionally specify a list of allowed auth collection names, default to any).
        $apis.requireAuth(optCollectionNames...)

        // Require the request client to be authenticated as superuser
        // (this is an alias for $apis.requireAuth("_superusers")).
        $apis.requireSuperuserAuth()

        // Require the request client to be authenticated as superuser OR
        // regular auth record with id matching the specified route parameter (default to "id").
        $apis.requireSuperuserOrOwnerAuth(ownerIdParam)

        // Changes the global 32MB default request body size limit (set it to 0 for no limit).
        // Note that system record routes have dynamic body size limit based on their collection field types.
        $apis.bodyLimit(limitBytes)

        // Compresses the HTTP response using Gzip compression scheme.
        $apis.gzip()

        // Instructs the activity logger to log only requests that have failed/returned an error.
        $apis.skipSuccessActivityLog()
    `}
/>

<HeadingLink title="默认全局注册中间件" tag="h5" />
<small class="txt-hint">
    以下列表主要用于希望在默认全局中间件优先级之前/之后插入自定义中间件的用户，例如：在限流器 <code>-1001</code> 之前注册自定义认证加载器，以便限流能基于已加载的认证状态正确应用。
</small>
<p>
    所有 PocketBase 应用默认注册了以下内部中间件（<em>按优先级排序</em>）：
    <br />
</p>
<ul>
    <li>
        <strong>WWW 重定向</strong>
        <small class="txt-hint">(id: pbWWWRedirect, priority: -99999)</small>
        <br />
        <em>
            如果请求主机与证书主机策略中的某个值匹配，则执行 www -> 非 www 重定向。
        </em>
    </li>
    <li>
        <strong>CORS</strong>
        <small class="txt-hint">(id: pbCors, priority: -1041)</small>
        <br />
        <em>
            默认允许所有来源（PocketBase 是无状态的且不依赖 cookie），但可通过 <code>--origins</code> 参数配置。
        </em>
    </li>
    <li>
        <strong>活动日志记录器</strong>
        <small class="txt-hint">(id: pbActivityLogger, priority: -1040)</small>
        <br />
        <em>将请求信息保存到日志辅助数据库。</em>
    </li>
    <li>
        <strong>自动 panic 恢复</strong>
        <small class="txt-hint">(id: pbPanicRecover, priority: -1030)</small>
        <br />
        <em>默认 panic 恢复处理器。</em>
    </li>
    <li>
        <strong>认证令牌加载器</strong>
        <small class="txt-hint">(id: pbLoadAuthToken, priority: -1020)</small>
        <br />
        <em>
            从 <code>Authorization</code> 请求头加载认证令牌，并将相关认证记录填充到请求事件（即 <code>e.auth</code>）。
        </em>
    </li>
    <li>
        <strong>安全响应头</strong>
        <small class="txt-hint">(id: pbSecurityHeaders, priority: -1010)</small>
        <br />
        <em>
            为响应添加默认常用安全头（<code>X-XSS-Protection</code>、
            <code>X-Content-Type-Options</code>、
            <code>X-Frame-Options</code>），可被其他中间件或路由操作覆盖。
        </em>
    </li>
    <li>
        <strong>限流</strong>
        <small class="txt-hint">(id: pbRateLimit, priority: -1000)</small>
        <br />
        <em
            >根据应用设置对客户端请求进行限流（如果未启用限流选项则不做处理）。</em
        >
    </li>
    <li>
        <strong>请求体大小限制</strong>
        <small class="txt-hint">(id: pbBodyLimit, priority: -990)</small>
        <br />
        <em>
            为所有自定义路由应用默认最大约 32MB 的请求体限制（系统记录路由根据集合字段类型动态调整）。可通过重新绑定 <code>$apis.bodyLimit(limitBytes)</code> 中间件在分组/路由级别覆盖。
        </em>
    </li>
</ul>

<HeadingLink title="错误响应" />
<p>
    PocketBase 拥有全局错误处理器，路由或中间件中返回或抛出的 <code>Error</code> 会被安全地转换为通用 API 错误，以避免意外泄露敏感信息（原始错误仅在 <em>Dashboard > Logs</em> 或 <code>--dev</code> 模式下可见）。
</p>
<p>
    为方便返回格式化的 json 错误响应，PocketBase 提供了 <code>ApiError</code> 构造器，可直接实例化或使用内置工厂方法。
    <br />
    仅当 <code>ApiError.data</code> 是 <code>ValidationError</code> 项的 map 时，才会在响应中返回。
</p>
<CodeBlock
    language="javascript"
    content={`
        // construct ApiError with custom status code and validation data error
        throw new ApiError(500, "something went wrong", {
            "title": new ValidationError("invalid_title", "Invalid or missing title"),
        })

        // if message is empty string, a default one will be set
        throw new BadRequestError(optMessage, optData)      // 400 ApiError
        throw new UnauthorizedError(optMessage, optData)    // 401 ApiError
        throw new ForbiddenError(optMessage, optData)       // 403 ApiError
        throw new NotFoundError(optMessage, optData)        // 404 ApiError
        throw new TooManyrequestsError(optMessage, optData) // 429 ApiError
        throw new InternalServerError(optMessage, optData)  // 500 ApiError
    `}
/>

<HeadingLink title="辅助方法" />

<HeadingLink title="服务静态目录" tag="h5" />
<p>
    <a href="/jsvm/functions/_apis.static.html" target="_blank" rel="noopener noreferrer">
        <code>$apis.static()</code>
    </a>
    用于从 <code>fs.FS</code> 实例服务静态目录内容。
</p>
<p>要求路由包含 <code>{"{path...}"}</code> 通配符参数。</p>
<CodeBlock
    language="javascript"
    content={`
        // serves static files from the provided dir (if exists)
        routerAdd("GET", "/{path...}", $apis.static($os.dirFS("/path/to/public"), false))
    `}
/>

<HeadingLink title="认证响应" tag="h5" />
<p>
    <a href="/jsvm/functions/_apis.recordAuthResponse.html" target="_blank" rel="noopener noreferrer">
        <code>$apis.recordAuthResponse()</code>
    </a>
    用于将标准化的 JSON 认证响应（即 token + record 数据）写入指定请求体。可作为自定义认证路由的返回结果。
</p>
<!-- prettier-ignore -->
<CodeBlock
    language="javascript"
    content={`
        routerAdd("POST", "/phone-login", (e) => {
            const data = new DynamicModel({
                phone:    "",
                password: "",
            })
            e.bindBody(data)

            let record = e.app.findFirstRecordByData("users", "phone", data.phone)
            if !record.validatePassword(data.password) {
                // return generic 400 error as a basic enumeration protection
                throw new BadRequestError("Invalid credentials")
            }

            return $apis.recordAuthResponse(e, record, "phone")
        })
    `}
/>

<HeadingLink title="丰富记录" tag="h5" />
<p>
    <a href="/jsvm/functions/_apis.enrichRecord.html" target="_blank" rel="noopener noreferrer">
        <code>$apis.enrichRecord()</code>
    </a>
    和
    <a href="/jsvm/functions/_apis.enrichRecords.html" target="_blank" rel="noopener noreferrer">
        <code>$apis.enrichRecords()</code>
    </a>
    辅助方法会解析请求上下文并丰富提供的记录，包括：
</p>
<ul>
    <li>
        展开关联关系（如果设置了 <code>defaultExpands</code> 或 <code>?expand</code> 查询参数）
    </li>
    <li>
        确保认证记录及其展开的认证关联的邮箱仅对当前登录超级用户、记录所有者或有管理权限的记录可见
    </li>
</ul>
<p>这些辅助方法也负责触发 <code>onRecordEnrich</code> 钩子事件。</p>
<CodeBlock
    language="javascript"
    content={`
        routerAdd("GET", "/custom-article", (e) => {
            let records = e.app.findRecordsByFilter("article", "status = 'active'", "-created", 40, 0)

            // enrich the records with the "categories" relation as default expand
            $apis.enrichRecords(e, records, "categories")

            return e.json(200, records)
        })
    `}
/>

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

