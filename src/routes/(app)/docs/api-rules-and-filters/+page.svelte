<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import FilterSyntax from "@/components/FilterSyntax.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<Toc />

<HeadingLink title="API rules" />
<p>
    <strong>API Rules</strong> 是你的 Collection 访问控制和数据过滤器。
</p>
<p>
    每个 Collection 有 <strong>5 条规则</strong>，分别对应特定的 API 操作：
</p>
<ul>
    <li>
        <code>listRule</code>
    </li>
    <li>
        <code>viewRule</code>
    </li>
    <li>
        <code>createRule</code>
    </li>
    <li>
        <code>updateRule</code>
    </li>
    <li>
        <code>deleteRule</code>
    </li>
</ul>
<p>
    Auth collections 还有一个额外的 <code>options.manageRule</code>，用于允许某个用户（甚至可以来自不同的 Collection）完全管理另一个用户的数据（例如更改他们的邮箱、密码等）。
</p>

<p>每条规则可以设置为：</p>
<ul>
    <li>
        <strong>"locked"</strong> - 即 <code>null</code>，表示只有授权的超级用户才能执行该操作
        <!--  -->
        （<strong>这是默认值</strong>）
    </li>
    <li>
        <strong>空字符串</strong> - 任何人都可以执行该操作（超级用户、已授权用户和访客）
    </li>
    <li>
        <strong>非空字符串</strong> - 只有满足规则过滤表达式的用户（无论是否已授权）才能执行该操作
    </li>
</ul>

<div class="alert alert-info">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            <strong>PocketBase API Rules 也作为记录过滤器！</strong>
            <br />
            换句话说，你可以只允许列出 Collection 中 "active" 状态的记录，只需使用如下简单的过滤表达式：
            <code>status = "active"</code>
            （其中 "status" 是你的 Collection 中定义的字段）。
        </p>
        <p>
            因此，如果请求不满足 <code>listRule</code>，API 会返回 200 并且 items 为空；不满足 <code>createRule</code> 返回 400；不满足 <code>viewRule</code>、<code>updateRule</code> 和 <code>deleteRule</code> 返回 404。
            <br />
            如果规则为 "locked"（即仅限超级用户），而请求方不是超级用户，则所有规则都会返回 403。
        </p>
        <p>
            当操作由已授权超级用户执行时，API Rules 会被忽略（<strong>超级用户拥有全部访问权限</strong>）！
        </p>
    </div>
</div>

<HeadingLink title="Filters syntax" />
<p>你可以在 Collection 的 API 规则标签页中查看可用字段的信息：</p>
<img
    src="/images/screenshots/collection-rules.png"
    alt="Collection API Rules filters screenshot"
    class="screenshot"
    width="550"
/>
<p>
    在输入规则过滤表达式时有自动补全功能帮助你，但通常你可以访问 <strong>3 组字段</strong>：
</p>
<ul>
    <li>
        <strong>你的 Collection schema 字段</strong>
        <br />
        这也包括所有嵌套的关联字段，例如：
        <code>someRelField.status != "pending"</code>
    </li>
    <li>
        <code><strong>@request.*</strong></code>
        <br />
        用于访问当前请求数据，如查询参数、body/form 字段、已授权用户状态等。
        <ul>
            <li>
                <code>@request.context</code> - 规则使用的上下文（例如：
                <code>@request.context != "oauth2"</code>）
                <br />
                <small class="txt-hint">
                    当前支持的 context 值有
                    <code>default</code>、
                    <code>oauth2</code>、
                    <code>otp</code>、
                    <code>password</code>、
                    <code>realtime</code>、
                    <code>protectedFile</code>。
                </small>
            </li>
            <li>
                <code>@request.method</code> - HTTP 请求方法（例如：
                <code>@request.method = "GET"</code>）
            </li>
            <li>
                <code>@request.headers.*</code> - 请求头部的字符串值（例如：
                <code>@request.headers.x_token = "test"</code>）
                <br />
                <small class="txt-hint">
                    注意：所有 header 键都会被转为小写，并将 "-" 替换为 "_"（例如 "X-Token" 变为 "x_token"）。
                </small>
            </li>
            <li>
                <code>@request.query.*</code> - 请求查询参数的字符串值（例如：
                <code>@request.query.page = "1"</code>）
            </li>
            <li>
                <code>@request.auth.*</code> - 当前已认证的模型（例如：
                <code>@request.auth.id != ""</code>）
            </li>
            <li>
                <code>@request.body.*</code> - 提交的 body 参数（例如：
                <code>@request.body.title != ""</code>）
                <br />
                <small class="txt-hint">
                    注意：上传的文件不属于 <code class="txt-sm">@request.body</code>，因为它们会被单独处理（<em>此行为未来可能会改变</em>）。
                </small>
            </li>
        </ul>
    </li>
    <li>
        <code><strong>@collection.*</strong></code>
        <p>
            该过滤器可用于针对与当前 Collection 没有关联字段但有共同字段值的其他 Collection，例如 category id：
        </p>
        <CodeBlock
            content={`
                @collection.news.categoryId ?= categoryId && @collection.news.author ?= @request.auth.id
            `}
        />
        <p>
            如果你想基于不同条件多次关联同一个 Collection，可以在 Collection 名称后添加 <code>:alias</code> 后缀定义别名。
        </p>
        <CodeBlock
            content={`
                // see https://github.com/pocketbase/pocketbase/discussions/3805#discussioncomment-7634791
                @request.auth.id != "" &&
                @collection.courseRegistrations.user ?= id &&
                @collection.courseRegistrations:auth.user ?= @request.auth.id &&
                @collection.courseRegistrations.courseGroup ?= @collection.courseRegistrations:auth.courseGroup
            `}
        />
    </li>
</ul>

<FilterSyntax />

<HeadingLink title="Special identifiers and modifiers" />

<HeadingLink title="@ macros" tag="h5" />
<p>以下日期时间宏可用，并可作为过滤表达式的一部分使用：</p>
<CodeBlock
    class="m-b-0"
    language="html"
    content={`
        // all macros are UTC based
        @now        - 当前时间（字符串）
        @second     - 当前秒数 (0-59)
        @minute     - 当前分钟数 (0-59)
        @hour       - 当前小时数 (0-23)
        @weekday    - 当前星期几 (0-6)
        @day        - 当前日期
        @month      - 当前月份
        @year       - 当前年份
        @yesterday  - 相对于 @now 的昨天时间（字符串）
        @tomorrow   - 相对于 @now 的明天时间（字符串）
        @todayStart - 当天开始时间（字符串）
        @todayEnd   - 当天结束时间（字符串）
        @monthStart - 当月开始时间（字符串）
        @monthEnd   - 当月结束时间（字符串）
        @yearStart  - 当年开始时间（字符串）
        @yearEnd    - 当年结束时间（字符串）
    `}
/>
<p>例如：</p>
<CodeBlock content={`@request.body.publicDate >= @now`} />

<HeadingLink title=":isset modifier" tag="h5" />
<p>
    <code>:isset</code> 字段修饰符仅适用于 <code>@request.*</code> 字段，可用于检查客户端是否提交了特定数据。例如，以下规则禁止更改 "role" 字段：
</p>
<CodeBlock
    class="m-b-0"
    content={`
        @request.body.role:isset = false
    `}
/>
<p>
    <small class="txt-hint">
        注意 <code class="txt-sm">@request.body.*:isset</code> 目前不支持检查新上传的文件，因为它们会被单独处理且无法序列化（<em>此行为未来可能会改变</em>）。
    </small>
</p>

<HeadingLink title=":length modifier" tag="h5" />
<p>
    <code>:length</code> 字段修饰符可用于检查数组字段（多文件、select、relation）的元素数量。
    <br />
    可用于 Collection schema 字段和 <code>@request.body.*</code> 字段。例如：
</p>
<CodeBlock
    class="m-b-0"
    content={`
        // 检查提交数据示例：{"someSelectField": ["val1", "val2"]}
        @request.body.someSelectField:length > 1

        // 检查现有记录字段长度
        someRelationField:length = 2
    `}
/>
<p>
    <small class="txt-hint">
        注意 <code class="txt-sm">@request.body.*:length</code> 目前不支持检查新上传的文件，因为它们会被单独处理且无法序列化（<em>此行为未来可能会改变</em>）。
    </small>
</p>

<HeadingLink title=":each modifier" tag="h5" />
<p>
    <code>:each</code> 字段修饰符仅适用于多选 <code>select</code>、<code>file</code> 和 <code>relation</code> 类型字段。可用于对字段数组中的每一项应用条件。例如：
</p>
<CodeBlock
    class="m-b-0"
    content={`
        // 检查所有提交的 select 选项是否包含 "create" 文本
        @request.body.someSelectField:each ~ "create"

        // 检查所有现有 someSelectField 是否以 "pb_" 前缀开头
        someSelectField:each ~ "pb_%"
    `}
/>
<p>
    <small class="txt-hint">
        注意 <code class="txt-sm">@request.body.*:each</code> 目前不支持检查新上传的文件，因为它们会被单独处理且无法序列化（<em>此行为未来可能会改变</em>）。
    </small>
</p>

<HeadingLink title=":lower modifier" tag="h5" />
<p>
    <code>:lower</code> 字段修饰符可用于进行小写字符串比较。例如：
</p>
<CodeBlock
    class="m-b-0"
    content={`
        // 检查提交的 body "title" 字段小写后是否等于 "test"（"Test"、"tEsT" 等）
        @request.body.title:lower = "test"

        // 匹配所有小写后 "title" 等于 "test" 的现有记录（"Test"、"tEsT" 等）
        title:lower ~ "test"
    `}
/>
<p>
    <small class="txt-hint">
        底层使用
        <a href="https://www.sqlite.org/lang_corefunc.html#lower" target="_blank" rel="noopener noreferrer">
            SQLite <code>LOWER</code> 标量函数
        </a>
        ，默认仅支持 ASCII 字符，除非加载了 ICU 扩展。
    </small>
</p>

<HeadingLink title="geoDistance(lonA, latA, lonB, latB)" tag="h5" />
<p>
    <code>geoDistance(lonA, latA, lonB, latB)</code> 函数可用于计算两地理点之间的哈弗辛距离（单位：公里）。
</p>
<p>
    该函数主要用于 <code>geoPoint</code> 字段类型，但参数也可以是任意数字或 Collection 字段标识符。如果标识符无法解析为数值，则为 <code>null</code>。注意 <code>geoDistance</code> 函数始终返回单行/记录值，即使部分参数来自多 relation 字段，也会应用“任意/至少一个”约束。
</p>
<p>例如：</p>
<CodeBlock
    class="m-b-0"
    content={`
        // 查询距离我当前位置小于 25 公里的办公室（address 是 offices collection 的 geoPoint 字段）
        geoDistance(address.lon, address.lat, 23.32, 42.69) < 25
    `}
/>

<HeadingLink title="Examples" />
<ul>
    <li class="m-b-sm">
        仅允许已注册用户访问：
        <CodeBlock
            content={`
                @request.auth.id != ""
            `}
        />
    </li>
    <li class="m-b-sm">
        仅允许已注册用户访问，并返回 "active" 或 "pending" 状态的记录：
        <CodeBlock
            content={`
                @request.auth.id != "" && (status = "active" || status = "pending")
            `}
        />
    </li>
    <li class="m-b-sm">
        仅允许已注册用户且其 id 在 <em>allowed_users</em> 多 relation 字段中的用户访问：
        <CodeBlock
            content={`
                @request.auth.id != "" && allowed_users.id ?= @request.auth.id
            `}
        />
    </li>
    <li class="m-b-sm">
        允许任何人访问，仅返回 <em>title</em> 字段值以 "Lorem" 开头的记录（如 "Lorem ipsum"）：
        <CodeBlock
            content={`
                title ~ "Lorem%"
            `}
        />
    </li>
</ul>
