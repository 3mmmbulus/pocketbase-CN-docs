<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import Toc from "@/components/Toc.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
</script>

<Toc />

<HeadingLink title="JavaScript 引擎" />
<p>
    预编译的 PocketBase v0.17+ 可执行文件内置了 ES5 JavaScript 引擎（<a
        href="https://github.com/dop251/goja"
        target="_blank"
        rel="nopppener noreferrer">goja</a
    >），允许你使用原生 JavaScript 编写自定义服务端代码。
</p>
<p>
    你可以通过在可执行文件旁边新建 <code>pb_hooks</code> 目录，并创建 <code>*.pb.js</code> 文件来开始。
</p>
<CodeBlock
    content={`
        // pb_hooks/main.pb.js

        routerAdd("GET", "/hello/{name}", (e) => {
            let name = e.request.pathValue("name")

            return e.json(200, { "message": "Hello " + name })
        })

        onRecordAfterUpdateSuccess((e) => {
            console.log("user updated...", e.record.get("email"))

            e.next()
        }, "users")
    `}
/>
<p>
    <em>
        为了方便起见，当你修改 <code>pb_hooks</code> 目录下的文件时，进程会自动重启/重载（目前仅支持 UNIX 系统）。<code>*.pb.js</code> 文件会按照文件名排序加载。
    </em>
</p>
<p>
    大多数情况下，JavaScript API 来源于 <a href="/docs/go-overview">Go</a>，但有两个主要区别：
</p>
<ul>
    <li>
        Go 导出的方法和字段名会被转换为 camelCase，例如：<br />
        <code>app.FindRecordById("example", "RECORD_ID")</code> 变为
        <code>$app.findRecordById("example", "RECORD_ID")</code>。
    </li>
    <li>错误会作为普通的 JavaScript 异常抛出，而不是以 Go 的值返回。</li>
</ul>

<HeadingLink title="全局对象" tag="h5" />
<p>以下是一些常用的全局对象，可以在任意位置访问：</p>
<ul>
    <li>
        <a href="/jsvm/variables/__hooks.html" target="_blank">
            <code>__hooks</code>
        </a>
        - 应用 <code>pb_hooks</code> 目录的绝对路径。
    </li>
    <li>
        <a href="/jsvm/modules/_app.html" target="_blank">
            <code>$app</code>
        </a> - 当前运行的 PocketBase 应用实例。
    </li>
    <li>
        <a href="/jsvm/modules/_apis.html" target="_blank">
            <code>$apis.*</code>
        </a> - API 路由辅助方法和中间件。
    </li>
    <li>
        <a href="/jsvm/modules/_os.html" target="_blank">
            <code>$os.*</code>
        </a> - 操作系统级别的功能（删除目录、执行 shell 命令等）。
    </li>
    <li>
        <a href="/jsvm/modules/_security.html" target="_blank">
            <code>$security.*</code>
        </a> - 用于创建和解析 JWT、生成随机字符串、AES 加密等底层辅助方法。
    </li>
    <li class="txt-bold">
        还有更多内容——所有可用 API 请参考
        <a href="/jsvm/index.html" target="_blank">JSVM 参考文档</a>。
    </li>
</ul>

<HeadingLink title="TypeScript 声明与代码补全" />
<p>
    虽然你不能直接使用 TypeScript（<em>除非你自行将其转译为 JS</em>），PocketBase 内置了 <strong>全局 TypeScript 声明</strong>，可以为全局变量、方法和参数等提供类型信息和文档说明，以及代码补全功能，只要你的编辑器支持 TypeScript LSP
    <em>（大多数编辑器都内置或可通过插件支持）</em>。
</p>
<p>
    类型声明存放在
    <code>pb_data/types.d.ts</code> 文件中。你可以在 JS 文件顶部通过
    <a
        href="https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-path-"
        target="_blank"
        rel="noopener">reference triple-slash 指令</a
    >
    引用这些声明：
</p>
<CodeBlock
    content={`
        /// <reference path="../pb_data/types.d.ts" />

        onBootstrap((e) => {
            e.next()

            console.log("App initialized!")
        })
    `}
/>
<p>
    如果引用类型后编辑器仍无法进行语法检查，可以尝试将文件扩展名改为 <code>.pb.ts</code>。
</p>

<HeadingLink title="注意事项与限制" />

<HeadingLink title="处理函数作用域" tag="h5" />
<p>
    每个处理函数（hook、路由、中间件等）都会
    <strong>被序列化并在各自独立的上下文中作为单独的“程序”执行</strong>。这意味着你无法访问处理函数作用域外部声明的自定义变量和函数。例如，下面的代码会失败：
</p>
<CodeBlock
    content={`
        const name = "test"

        onBootstrap((e) => {
            e.next()

            console.log(name) // <-- name 在处理函数内部会是 undefined
        })
    `}
/>
<p class="txt-hint txt-italic">
    上述序列化与隔离上下文也是导致错误堆栈跟踪行号可能不准确的原因。
</p>
<p>
    如果需要在不同处理函数之间共享/复用代码，可以将可复用部分作为本地模块导出，并在处理函数内部通过 <code>require()</code> 加载。但请注意，已加载的模块使用共享注册表，尽量避免修改以防止并发问题：
</p>
<!-- prettier-ignore -->
<CodeBlock
    content={`
        onBootstrap((e) => {
            e.next()

            const config = require(` + "`${__hooks}/config.js`" + `)
            console.log(config.name)
        })
    `}
/>

<HeadingLink title="相对路径" tag="h5" />
<p>
    文件的相对路径是相对于当前工作目录（CWD），而不是 <code>pb_hooks</code>。
    <br />
    如需获取 <code>pb_hooks</code> 目录的绝对路径，可以使用全局变量
    <code class="txt-bold">__hooks</code>。
</p>

<HeadingLink title="加载模块" tag="h5" />
<div class="alert alert-danger m-b-sm">
    <div class="icon">
        <i class="ri-alert-line" />
    </div>
    <div class="content">
        <p>
            请注意，内置 JavaScript 引擎并非 Node.js 或浏览器环境，依赖 <em>window</em>、<em>fs</em>、
            <em>fetch</em>、<em>buffer</em> 或其他非 ES5 标准运行时 API 的模块可能无法使用！
        </p>
    </div>
</div>
<p>
    你可以通过指定本地文件系统路径或模块名加载模块，模块名会自动在以下位置查找：
</p>
<ul>
    <li>当前工作目录（<em>也影响相对路径</em>）</li>
    <li>任意 <code>node_modules</code> 目录</li>
    <li>任意父级 <code>node_modules</code> 目录</li>
</ul>
<p>
    目前仅支持 CommonJS (CJS) 模块，可通过 <code>const x = require(...)</code> 加载。<br />
    如需加载 ECMAScript 模块（ESM），需先用打包工具（如
    <a href="https://rollupjs.org/" target="_blank" rel="noopener noreferrer">rollup</a>、
    <a href="https://webpack.js.org/" target="_blank" rel="noopener noreferrer">webpack</a>、
    <a href="https://browserify.org/" target="_blank" rel="noopener noreferrer">browserify</a> 等）预编译和转换依赖。
</p>
<p>本地模块常用于加载共享辅助方法或配置参数，例如：</p>
<CodeBlock
    content={`
        // pb_hooks/utils.js
        module.exports = {
            hello: (name) => {
                console.log("Hello " + name)
            }
        }
    `}
/>
<div class="clearfix m-b-10" />
<!-- prettier-ignore -->
<CodeBlock
    content={`
        // pb_hooks/main.pb.js
        onBootstrap((e) => {
            e.next()

            const utils = require(` + "`${__hooks}/utils.js`" + `)
            utils.hello("world")
        })
    `}
/>
<div class="alert alert-info m-t-10 m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            已加载的模块使用共享注册表，尽量避免修改以防止并发问题。
        </p>
    </div>
</div>

<HeadingLink title="性能" tag="h5" />
<p>
    预编译可执行文件内置了 <strong>15 个预热的 JS 运行时池</strong>，有助于保持处理函数的执行速度与 Go 代码相当（参见
    <a
        href="https://github.com/pocketbase/benchmarks/blob/master/results/hetzner_cax11.md#go-vs-js-route-execution"
        target="blank"
        rel="noopener noreferrer">性能测试</a
    >）。你可以通过 <code>--hooksPool=50</code> 参数手动调整池大小（<em
        >增加池大小可提升高并发场景下的性能，但也会增加内存占用</em
    >）。
</p>
<p>
    注意，如果你的处理函数中有大量计算密集型的纯 JavaScript 任务（如加密、随机数生成等），性能可能会下降。此类场景建议优先使用已暴露的 <a
        href="/jsvm/index.html"
        target="_blank">Go 绑定</a
    >
    （如 <code>$security.randomString(10)</code>）。
</p>

<HeadingLink title="引擎限制" tag="h5" />
<p>
    我们继承了内置 JavaScript 引擎的一些限制和注意事项
    <!-- prettier-ignore -->
    （<a href="https://github.com/dop251/goja" target="_blank" rel="nopppener noreferrer">goja</a>）：
</p>
<ul>
    <li>已实现大部分 ES6 功能，但尚未完全符合规范。</li>
    <li>
        单个处理函数内不支持并发执行（即不支持 <code>setTimeout</code>/<code
            >setInterval</code
        >）。
    </li>
    <li>
        包裹的 Go 结构类型（如 map、slice）有一些特殊性，行为与原生 ECMAScript 值不完全一致（详情见
        <a
            href="https://pkg.go.dev/github.com/dop251/goja#Runtime.ToValue"
            target="blank"
            rel="noreferrer noopener">goja ToValue</a
        >）。
    </li>
    <li>
        与上述相关，数据库 <code>json</code> 字段值需要使用 <code>get()</code> 和
        <code>set()</code> 辅助方法（<em>未来可能会有变化</em>）。
    </li>
</ul>

