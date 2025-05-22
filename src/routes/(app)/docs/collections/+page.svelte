<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import Toc from "@/components/Toc.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import Accordion from "@/components/Accordion.svelte";
</script>

<Toc />

<HeadingLink title="概述" />
<p>
    <strong>集合</strong>代表你的应用数据。在底层，它们由普通的 SQLite 表支持，这些表会根据集合的
    <strong>名称</strong>和<strong>字段</strong>（列）自动生成。
</p>
<p>
    集合中的单条数据称为<strong>记录</strong>（即 SQL 表中的一行）。
</p>
<p>
    你可以通过管理后台、Web API（使用
    <a href="/docs/how-to-use/">客户端 SDK</a>
    （<em>仅超级用户</em>））或通过
    <a href="/docs/go-migrations/">Go</a>/<a href="/docs/js-migrations/">JavaScript</a>
    迁移脚本进行管理你的<strong>集合</strong>。
</p>
<p>
    同样，你也可以通过管理后台、Web API（使用
    <a href="/docs/how-to-use/">客户端 SDK</a>
    ）或通过
    <a href="/docs/go-records/">Go</a>/<a href="/docs/js-records/">JavaScript</a>
    记录操作来管理你的<strong>记录</strong>。
</p>
<p>以下是管理后台中集合编辑面板的示例：</p>
<img src="/images/screenshots/collection-panel.png" alt="集合面板截图" class="screenshot" />

<p>
    当前有 3 种集合类型：<strong>基础</strong>、<strong>视图</strong> 和
    <strong>认证</strong>。
</p>

<HeadingLink title="基础集合" tag="h5" />
<p>
    <strong>基础集合</strong>是默认的集合类型，可用于存储任意应用数据（如文章、产品、帖子等）。
</p>

<HeadingLink title="视图集合" tag="h5" />
<p>
    <strong>视图集合</strong>是一种只读集合，数据来源于普通 SQL <code>SELECT</code> 语句，允许用户进行聚合或其他自定义查询。
    <br />
    例如，以下查询将创建一个只读集合，包含 3 个 <em>posts</em>
    字段 - <em>id</em>、<em>name</em> 和 <em>totalComments</em>：
</p>
<CodeBlock
    language="sql"
    content={`
        SELECT
            posts.id,
            posts.name,
            count(comments.id) as totalComments
        FROM posts
        LEFT JOIN comments on comments.postId = posts.id
        GROUP BY posts.id
    `}
/>
<div class="alert alert-info m-t-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        视图集合不会接收实时事件，因为它们没有创建/更新/删除操作。
    </div>
</div>

<HeadingLink title="认证集合" tag="h5" />
<p>
    <strong>认证集合</strong>拥有<strong>基础集合</strong>的全部功能，并额外包含一些特殊字段，帮助你管理应用用户并提供多种认证选项。
</p>
<p>
    每个认证集合都包含以下特殊系统字段：
    <code>email</code>、<code>emailVisibility</code>、<code>verified</code>、
    <code>password</code> 和 <code>tokenKey</code>。
    <br />
    这些字段不能重命名或删除，但可以通过各自的字段选项进行配置。例如，你可以设置用户邮箱为必填或可选。
</p>
<p>
    你可以创建任意多个认证集合（如 users、managers、staffs、members、clients 等），每个集合拥有独立的字段、登录和记录管理接口。
</p>
<p>你可以构建各种不同的访问控制：</p>
<ul>
    <li>
        <strong>角色（分组）</strong>
        <br />
        <em>
            例如，你可以在认证集合中添加一个 "role" <code>select</code> 字段，选项为 "employee" 和 "staff"。然后在其他集合中定义如下规则，仅允许 "staff" 访问：
            <br />
            <code>@request.auth.role = "staff"</code>
        </em>
    </li>
    <li>
        <strong>关联（所有权）</strong>
        <br />
        <em>
            假设你有 2 个集合 - "posts" 基础集合 和 "users" 认证集合。在 "posts" 集合中可以创建 "author"
            <code>relation</code> 字段，指向 "users" 集合。要仅允许记录的 "author" 访问，可以使用如下规则：
            <code>@request.auth.id != "" && author = @request.auth.id</code>
            <br />
            也支持嵌套关联字段查找，包括反向关联，例如：
            <code>someRelField.anotherRelField.author = @request.auth.id</code>
        </em>
    </li>
    <li>
        <strong>托管</strong>
        <br />
        <em>
            除了默认的 "List"、"View"、"Create"、"Update"、"Delete" API 规则外，认证集合还拥有特殊的 "Manage" API 规则，可用于允许某个用户（甚至可以来自不同集合）完全管理另一个用户的数据（如更改邮箱、密码等）。
        </em>
    </li>
    <li>
        <strong>混合</strong>
        <br />
        <em>
            你可以根据实际需求构建混合方案。多个规则可用括号 <code>()</code> 分组，并用 <code>&&</code>
            （与）和 <code>||</code>（或）运算符组合：
            <br />
            <code>
                @request.auth.id != "" && (@request.auth.role = "staff" || author = @request.auth.id)
            </code>
        </em>
    </li>
</ul>

<HeadingLink title="字段" />
<div class="alert alert-info">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            所有集合字段<em>（<code>JSONField</code> 除外）</em>都为<strong>非空，且使用零值</strong>作为缺省值（<code>text</code> 类型为空字符串，<code>number</code> 类型为 0 等）。
        </p>
        <p>
            所有字段的修饰符在 Web API 和记录 Get/Set 方法中均支持。
        </p>
    </div>
</div>

<div class="accordions">
    <Accordion single title="BoolField">
        <div class="content">
            <p>
                BoolField 定义 <code>bool</code> 类型字段，用于存储单个 <code>false</code>
                （默认）或 <code>true</code> 值。
            </p>
        </div>
    </Accordion>
    <Accordion single title="NumberField">
        <div class="content">
            <p>
                NumberField 定义 <code>number</code> 类型字段，用于存储数值/float64 类型的值：
                <code>0</code>（默认）、<code>2</code>、<code>-1</code>、<code>1.5</code>。
            </p>
            <p>支持以下额外的设置修饰符：</p>
            <ul>
                <li>
                    <code>fieldName<strong>+</strong></code>
                    向已存在的记录值加上指定数值。
                </li>
                <li>
                    <code>fieldName<strong>-</strong></code>
                    从已存在的记录值减去指定数值。
                </li>
            </ul>
        </div>
    </Accordion>
    <Accordion single title="TextField">
        <div class="content">
            <p>
                TextField 定义 <code>text</code> 类型字段，用于存储字符串值：
                <code>""</code>（默认）、<code>"example"</code>。
            </p>
            <p>支持以下额外的设置修饰符：</p>
            <ul>
                <li>
                    <code>fieldName<strong>:autogenerate</strong></code>
                    如果设置了 <code>AutogeneratePattern</code> 字段选项，则自动生成字段值。
                    <br />
                    例如，提交：
                    <code>{`{"slug:autogenerate":"abc-"}`}</code> 会生成 <code>"abc-[random]"</code>
                    <code>slug</code> 字段值。
                </li>
            </ul>
        </div>
    </Accordion>
    <Accordion single title="EmailField">
        <div class="content">
            <p>
                EmailField 定义 <code>email</code> 类型字段，用于存储单个邮箱字符串地址：
                <code>""</code>（默认）、<code>"john@example.com"</code>。
            </p>
        </div>
    </Accordion>
    <Accordion single title="URLField">
        <div class="content">
            <p>
                URLField 定义 <code>url</code> 类型字段，用于存储单个 URL 字符串值：
                <code>""</code>（默认）、<code>"https://example.com"</code>。
            </p>
        </div>
    </Accordion>
    <Accordion single title="EditorField">
        <div class="content">
            <p>
                EditorField 定义 <code>editor</code> 类型字段，用于存储 HTML 格式文本：
                <code>""</code>（默认）、<code>{`<p>example</p>`}</code>。
            </p>
        </div>
    </Accordion>
    <Accordion single title="DateField">
        <div class="content">
            <p>
                DateField 定义 <code>date</code> 类型字段，用于存储单个日期时间字符串值：
                <code>""</code>（默认）、<code>"2022-01-01 00:00:00.000Z"</code>。
            </p>
            <p>
                所有 PocketBase 日期目前均采用 RFC3399 格式 <code>Y-m-d H:i:s.uZ</code>
                （如 <code>2024-11-10 18:45:27.123Z</code>）。
            </p>
            <p>
                日期按字符串比较，因此在使用日期字段过滤时需指定完整的日期时间字符串。例如筛选某一天（如 2024 年 11 月 19 日）可使用：
                <code>
                    {`created >= '2024-11-19 00:00:00.000Z' && created <= '2024-11-19 23:59:59.999Z'`}
                </code>
            </p>
        </div>
    </Accordion>
    <Accordion single title="AutodateField">
        <div class="content">
            <p>
                AutodateField 定义 <code>autodate</code> 类型字段，类似于 DateField，但其值会在记录创建/更新时自动设置。
            </p>
            <p>该字段通常用于定义如 "created" 和 "updated" 的时间戳字段。</p>
        </div>
    </Accordion>
    <Accordion single title="SelectField">
        <div class="content">
            <p>
                SelectField 定义 <code>select</code> 类型字段，用于从预设列表中存储单个或多个字符串值。
            </p>
            <p>
                通常用于处理类似枚举的值，如
                <code>pending/public/private</code>
                状态，简单的 <code>client/staff/manager/admin</code> 角色等。
            </p>
            <p>
                对于<strong>单选</strong> <code>select</code>
                <em>（<code>MaxSelect</code> 选项为 {`<=`} 1）</em>
                字段值为字符串：
                <code>""</code>、<code>"optionA"</code>。
            </p>
            <p>
                对于<strong>多选</strong> <code>select</code>
                <em>（<code>MaxSelect</code> 选项为 {`>=`} 2）</em>
                字段值为数组：
                <code>[]</code>、<code>["optionA", "optionB"]</code>。
            </p>
            <p>支持以下额外的设置修饰符：</p>
            <ul>
                <li>
                    <code>fieldName<strong>+</strong></code>
                    向现有值追加一个或多个值。
                </li>
                <li>
                    <code><strong>+</strong>fieldName</code>
                    向现有值前置一个或多个值。
                </li>
                <li>
                    <code>fieldName<strong>-</strong></code>
                    从现有值中移除一个或多个值。
                </li>
            </ul>
            <p>例如：<code>{`{"permissions+": "optionA", "roles-": ["staff", "editor"]}`}</code></p>
        </div>
    </Accordion>
    <Accordion single title="FileField">
        <div class="content">
            <p>
                FileField 定义 <code>file</code> 类型字段，用于管理记录文件。
            </p>
            <p>
                PocketBase 只在数据库中存储文件名，文件本身根据应用存储设置存储在本地磁盘或 S3。
            </p>
            <p>
                对于<strong>单文件</strong> <code>file</code>
                <em>（<code>MaxSelect</code> 选项为 {`<=`} 1）</em>
                存储值为字符串：
                <code>""</code>、<code>"file1_Ab24ZjL.png"</code>。
            </p>
            <p>
                对于<strong>多文件</strong> <code>file</code>
                <em>（<code>MaxSelect</code> 选项为 {`>=`} 2）</em>
                存储值为数组：
                <code>[]</code>、<code>["file1_Ab24ZjL.png", "file2_Frq24ZjL.txt"]</code>。
            </p>
            <p>支持以下额外的设置修饰符：</p>
            <ul>
                <li>
                    <code>fieldName<strong>+</strong></code>
                    向现有字段值追加一个或多个文件。
                </li>
                <li>
                    <code><strong>+</strong>fieldName</code>
                    向现有字段值前置一个或多个文件。
                </li>
                <li>
                    <code>fieldName<strong>-</strong></code>
                    从现有字段值中删除一个或多个文件。
                </li>
            </ul>
            <p>
                例如：
                <code>
                    {`{"documents+": new File(...), "documents-": ["file1_Ab24ZjL.txt", "file2_Frq24ZjL.txt"]}`}
                </code>
            </p>
            <p>
                你可以在
                <a href="/docs/files-handling/">文件上传与处理</a> 指南中查看更多详细信息。
            </p>
        </div>
    </Accordion>
    <Accordion single title="RelationField">
        <div class="content">
            <p>
                RelationField 定义 <code>relation</code> 类型字段，用于存储单个或多个集合记录引用。
            </p>
            <p>
                对于<strong>单选</strong> <code>relation</code>
                <em>（<code>MaxSelect</code> 选项为 {`<=`} 1）</em>
                字段值为字符串：
                <code>""</code>、<code>"RECOD_ID"</code>。
            </p>
            <p>
                对于<strong>多选</strong> <code>relation</code>
                <em>（<code>MaxSelect</code> 选项为 {`>=`} 2）</em>
                字段值为数组：
                <code>[]</code>、<code>["RECORD_ID1", "RECORD_ID2"]</code>。
            </p>
            <p>支持以下额外的设置修饰符：</p>
            <ul>
                <li>
                    <code>fieldName<strong>+</strong></code>
                    向现有值追加一个或多个 ID。
                </li>
                <li>
                    <code><strong>+</strong>fieldName</code>
                    向现有值前置一个或多个 ID。
                </li>
                <li>
                    <code>fieldName<strong>-</strong></code>
                    从现有值中移除一个或多个 ID。
                </li>
            </ul>
            <p>例如：<code>{`{"users+": "USER_ID", "categories-": ["CAT_ID1", "CAT_ID2"]}`}</code></p>
        </div>
    </Accordion>
    <Accordion single title="JSONField">
        <div class="content">
            <p>
                JSONField 定义 <code>json</code> 类型字段，用于存储任意序列化的 JSON 值，
                包括 <code>null</code>（默认）。
            </p>
        </div>
    </Accordion>
    <Accordion single title="GeoPoint">
        <div class="content">
            <p>
                GeoPoint 定义 <code>geoPoint</code> 类型字段，用于存储地理坐标
                （经度、纬度）作为序列化的 JSON 对象。例如：
                <code>{`{"lon":12.34,"lat":56.78}`}</code>。
            </p>
            <p>
                <code>geoPoint</code> 的默认/零值为 "Null Island"，即
                <code>{`{"lon":0,"lat":0}`}</code>。
            </p>
            <p>
                在使用 Go/JSVM 扩展 PocketBase 时，<code>geoPoint</code> 字段值可以设置为
                <code>types.GeoPoint</code> 实例或包含 <code>lon</code> 和
                <code>lat</code> 键的常规映射：
            </p>
            <CodeTabs
                go={`
                    // set types.GeoPoint
                    record.Set("address", types.GeoPoint{Lon:12.34, Lat:45.67})

                    // set map[string]any
                    record.Set("address", map[string]any{"lon":12.34, "lat":45.67})

                    // retrieve the field value as types.GeoPoint struct
                    address := record.GetGeoPoint("address")
                `}
                js={`
                    record.set("address", {"lon":12.34, "lat":45.67})

                    const address = record.get("address")
                `}
            />
        </div>
    </Accordion>
</div>
