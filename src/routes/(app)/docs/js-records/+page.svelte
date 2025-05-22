<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import TransactionInfoJS from "../TransactionInfoJS.svelte";
</script>

<p>
    扩展 PocketBase 时最常见的任务可能就是查询和操作你的集合记录。
</p>
<p>
    你可以在
    <a href="/jsvm/interfaces/core.Record.html" target="_blank" rel="noopener noreferrer">
        <code>core.Record</code>
    </a>
    类型接口中找到所有支持的 Record 模型方法的详细文档，下面是一些最常用方法的示例。
</p>

<Toc />

<HeadingLink title="设置字段值" />
<CodeBlock
    language="javascript"
    content={`
        // sets the value of a single record field
        // (field type specific modifiers are also supported)
        record.set("title", "example")
        record.set("users+", "6jyr1y02438et52") // append to existing value

        // populates a record from a data map
        // (calls set() for each entry of the map)
        record.load(data)
    `}
/>

<HeadingLink title="获取字段值" />
<CodeBlock
    language="javascript"
    content={`
        // retrieve a single record field value
        // (field specific modifiers are also supported)
        record.get("someField")            // -> any (without cast)
        record.getBool("someField")        // -> cast to bool
        record.getString("someField")      // -> cast to string
        record.getInt("someField")         // -> cast to int
        record.getFloat("someField")       // -> cast to float64
        record.getDateTime("someField")    // -> cast to types.DateTime
        record.getStringSlice("someField") // -> cast to []string

        // retrieve the new uploaded files
        // (e.g. for inspecting and modifying the file(s) before save)
        record.getUnsavedFiles("someFileField")

        // unmarshal a single json field value into the provided result
        let result = new DynamicModel({ ... })
        record.unmarshalJSONField("someJsonField", result)

        // retrieve a single or multiple expanded data
        record.expandedOne("author")     // -> as null|Record
        record.expandedAll("categories") // -> as []Record

        // export all the public safe record fields in a plain object
        // (note: "json" type field values are exported as raw bytes array)
        record.publicExport()
    `}
/>

<HeadingLink title="认证访问器" />
<CodeBlock
    language="javascript"
    content={`
        record.isSuperuser() // alias for record.collection().name == "_superusers"

        record.email()         // alias for record.get("email")
        record.setEmail(email) // alias for record.set("email", email)

        record.verified()         // alias for record.get("verified")
        record.setVerified(false) // alias for record.set("verified", false)

        record.tokenKey()        // alias for record.get("tokenKey")
        record.setTokenKey(key)  // alias for record.set("tokenKey", key)
        record.refreshTokenKey() // alias for record.set("tokenKey:autogenerate", "")

        record.validatePassword(pass)
        record.setPassword(pass)   // alias for record.set("password", pass)
        record.setRandomPassword() // sets cryptographically random 30 characters string as password
    `}
/>

<HeadingLink title="副本" />
<CodeBlock
    language="javascript"
    content={`
        // returns a shallow copy of the current record model populated
        // with its ORIGINAL db data state and everything else reset to the defaults
        // (usually used for comparing old and new field values)
        record.original()

        // returns a shallow copy of the current record model populated
        // with its LATEST data state and everything else reset to the defaults
        // (aka. no expand, no custom fields and with default visibility flags)
        record.fresh()

        // returns a shallow copy of the current record model populated
        // with its ALL collection and custom fields data, expand and visibility flags
        record.clone()
    `}
/>

<HeadingLink title="隐藏/显示字段" />
<p>
    可以在仪表盘中将集合字段标记为“隐藏”，以防止普通用户访问该字段的值。
</p>
<p>
    Record 模型还提供了进一步控制字段序列化可见性的选项，作为“隐藏”字段选项的补充，
    可通过
    <a href="/jsvm/interfaces/core.Record.html#hide" target="_blank" rel="noopener noreferrer">
        <code>record.hide(fieldNames...)</code>
    </a>
    和
    <a href="/jsvm/interfaces/core.Record.html#unhide" target="_blank" rel="noopener noreferrer">
        <code>record.unhide(fieldNames...)</code>
    </a>
    方法实现。
</p>
<p>
    通常 <code>hide/unhide</code> 方法会与 <code>onRecordEnrich</code> 钩子结合使用，
    该钩子会在每次记录丰富（列表、查看、创建、更新、实时变更等）时被调用。例如：
</p>
<CodeBlock
    language="javascript"
    content={`
        onRecordEnrich((e) => {
            // dynamically show/hide a record field depending on whether the current
            // authenticated user has a certain "role" (or any other field constraint)
            if (
                !e.requestInfo.auth ||
                (!e.requestInfo.auth.isSuperuser() && e.requestInfo.auth.get("role") != "staff")
            ) {
                e.record.hide("someStaffOnlyField")
            }

            e.next()
        }, "articles")
    `}
/>
<div class="alert alert-info m-t-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            对于不属于记录集合 schema 的自定义字段，必须显式调用
            <code>record.withCustomData(true)</code> 才能在公开序列化中包含它们。
        </p>
    </div>
</div>

<HeadingLink title="获取记录" />

<HeadingLink title="获取单条记录" tag="h5" />
<p class="txt-hint">所有单条记录检索方法在未找到记录时会抛出错误。</p>
<CodeBlock
    language="javascript"
    content={`
        // retrieve a single "articles" record by its id
        let record = $app.findRecordById("articles", "RECORD_ID")

        // retrieve a single "articles" record by a single key-value pair
        let record = $app.findFirstRecordByData("articles", "slug", "test")

        // retrieve a single "articles" record by a string filter expression
        // (NB! use "{:placeholder}" to safely bind untrusted user input parameters)
        let record = $app.findFirstRecordByFilter(
            "articles",
            "status = 'public' && category = {:category}",
            { "category": "news" },
        )
    `}
/>

<HeadingLink title="获取多条记录" tag="h5" />
<p class="txt-hint">所有多条记录检索方法在未找到记录时返回空数组。</p>
<CodeBlock
    language="javascript"
    content={`
        // retrieve multiple "articles" records by their ids
        let records = $app.findRecordsByIds("articles", ["RECORD_ID1", "RECORD_ID2"])

        // retrieve the total number of "articles" records in a collection with optional dbx expressions
        let totalPending = $app.countRecords("articles", $dbx.hashExp({"status": "pending"}))

        // retrieve multiple "articles" records with optional dbx expressions
        let records = $app.findAllRecords("articles",
            $dbx.exp("LOWER(username) = {:username}", {"username": "John.Doe"}),
            $dbx.hashExp({"status": "pending"}),
        )

        // retrieve multiple paginated "articles" records by a string filter expression
        // (NB! use "{:placeholder}" to safely bind untrusted user input parameters)
        let records = $app.findRecordsByFilter(
            "articles",                                    // collection
            "status = 'public' && category = {:category}", // filter
            "-published",                                   // sort
            10,                                            // limit
            0,                                             // offset
            { "category": "news" },                        // optional filter params
        )
    `}
/>

<HeadingLink title="获取认证记录" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        // retrieve a single auth record by its email
        let user = $app.findAuthRecordByEmail("users", "test@example.com")

        // retrieve a single auth record by JWT
        // (you could also specify an optional list of accepted token types)
        let user = $app.findAuthRecordByToken("YOUR_TOKEN", "auth")
    `}
/>

<HeadingLink title="自定义记录查询" tag="h5" />
<p>
    除了上述查询助手外，你还可以使用
    <a href="/jsvm/functions/_app.recordQuery.html" target="_blank" rel="noopener noreferrer">
        <code>$app.recordQuery(collection)</code>
    </a>
    方法创建自定义 Record 查询。它返回一个 SELECT 数据库构建器，可与
    <a href="/docs/js-database">数据库指南</a>
    中描述的相同方法一起使用。
</p>
<CodeBlock
    language="javascript"
    content={`
        function findTopArticle() {
            let record = new Record();

            $app.recordQuery("articles")
                .andWhere($dbx.hashExp({ "status": "active" }))
                .orderBy("rank ASC")
                .limit(1)
                .one(record)

            return record
        }

        let article = findTopArticle()
    `}
/>
<p>
    要使用 <code>all()</code> 执行器获取<strong>多条</strong> Record 模型，可以使用
    <code>arrayOf(new Record)</code>
    创建一个数组占位符，用于填充解析后的数据库结果。
</p>
<CodeBlock
    language="javascript"
    content={`
        // the below is identical to
        // $app.findRecordsByFilter("articles", "status = 'active'", '-published', 10)
        // but allows more advanced use cases and filtering (aggregations, subqueries, etc.)
        function findLatestArticles() {
            let records = arrayOf(new Record);

            $app.recordQuery("articles")
                .andWhere($dbx.hashExp({ "status": "active" }))
                .orderBy("published DESC")
                .limit(10)
                .all(records)

            return records
        }

        let articles = findLatestArticles()
    `}
/>

<HeadingLink title="创建新记录" />

<HeadingLink title="以编程方式创建新记录" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        let collection = $app.findCollectionByNameOrId("articles")

        let record = new Record(collection)

        record.set("title", "Lorem ipsum")
        record.set("active", true)

        // field type specific modifiers can also be used
        record.set("slug:autogenerate", "post-")

        // new files must be one or a slice of filesystem.File values
        //
        // note1: see all factories in /jsvm/modules/_filesystem.html
        // note2: for reading files from a request event you can also use e.findUploadedFiles("fileKey")
        let f1 = $filesystem.fileFromPath("/local/path/to/file1.txt")
        let f2 = $filesystem.fileFromBytes("test content", "file2.txt")
        let f3 = $filesystem.fileFromURL("https://example.com/file3.pdf")
        record.set("documents", [f1, f2, f3])

        // validate and persist
        // (use saveNoValidate to skip fields validation)
        $app.save(record);
    `}
/>

<HeadingLink title="拦截创建请求" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        onRecordCreateRequest((e) => {
            // ignore for superusers
            if (e.hasSuperuserAuth()) {
                return e.next()
            }

            // overwrite the submitted "status" field value
            e.record.set("status", "pending")

            // or you can also prevent the create event by returning an error
            let status = e.record.get("status")
            if (
                status != "pending" &&
                // guest or not an editor
                (!e.auth || e.auth.get("role") != "editor")
            ) {
                throw new BadRequestError("Only editors can set a status different from pending")
            }

            e.next()
        }, "articles")
    `}
/>

<HeadingLink title="更新已有记录" />

<HeadingLink title="以编程方式更新已有记录" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        let record = $app.findRecordById("articles", "RECORD_ID")

        record.set("title", "Lorem ipsum")

        // delete existing record files by specifying their file names
        record.set("documents-", ["file1_abc123.txt", "file3_abc123.txt"])

        // append one or more new files to the already uploaded list
        //
        // note1: see all factories in /jsvm/modules/_filesystem.html
        // note2: for reading files from a request event you can also use e.findUploadedFiles("fileKey")
        let f1 = $filesystem.fileFromPath("/local/path/to/file1.txt")
        let f2 = $filesystem.fileFromBytes("test content", "file2.txt")
        let f3 = $filesystem.fileFromURL("https://example.com/file3.pdf")
        record.set("documents+", [f1, f2, f3])

        // validate and persist
        // (use saveNoValidate to skip fields validation)
        $app.save(record);
    `}
/>

<HeadingLink title="拦截更新请求" tag="h5" />
<CodeBlock
    language="javascript"
    content={`
        onRecordUpdateRequest((e) => {
            // ignore for superusers
            if (e.hasSuperuserAuth()) {
                return e.next()
            }

            // overwrite the submitted "status" field value
            e.record.set("status", "pending")

            // or you can also prevent the create event by returning an error
            let status = e.record.get("status")
            if (
                status != "pending" &&
                // guest or not an editor
                (!e.auth || e.auth.get("role") != "editor")
            ) {
                throw new BadRequestError("Only editors can set a status different from pending")
            }

            e.next()
        }, "articles")
    `}
/>

<HeadingLink title="删除记录" />
<CodeBlock
    language="javascript"
    content={`
        let record = $app.findRecordById("articles", "RECORD_ID")

        $app.delete(record)
    `}
/>

<HeadingLink title="事务" />
<TransactionInfoJS />
<CodeBlock
    language="javascript"
    content={`
        let titles = ["title1", "title2", "title3"]

        let collection = $app.findCollectionByNameOrId("articles")

        $app.runInTransaction((txApp) => {
            // create new record for each title
            for (let title of titles) {
                let record = new Record(collection)

                record.set("title", title)

                txApp.save(record)
            }
        })
    `}
/>

<HeadingLink title="以编程方式展开关联关系" />
<p>
    你可以使用
    <a href="/jsvm/functions/_app.expandRecord.html" target="_blank" rel="noopener noreferrer">
        <code>$app.expandRecord(record, expands, customFetchFunc)</code>
    </a>
    展开单条记录的关联关系，或使用
    <a href="/jsvm/functions/_app.expandRecords.html" target="_blank" rel="noopener noreferrer">
        <code>$app.expandRecords(records, expands, customFetchFunc)</code>
    </a>
    展开多条记录的关联关系。
</p>
<p>
    加载后，你可以通过
    <a href="/jsvm/interfaces/core.Record.html#expandedOne" target="_blank" rel="noopener noreferrer">
        <code>record.expandedOne(relName)</code>
    </a>
    或
    <a href="/jsvm/interfaces/core.Record.html#expandedAll" target="_blank" rel="noopener noreferrer">
        <code>record.expandedAll(relName)</code> 方法访问已展开的关联数据。
    </a>
</p>
<p>例如：</p>
<CodeBlock
    language="javascript"
    content={`
        let record = $app.findFirstRecordByData("articles", "slug", "lorem-ipsum")

        // expand the "author" and "categories" relations
        $app.expandRecord(record, ["author", "categories"], null)

        // print the expanded records
        console.log(record.expandedOne("author"))
        console.log(record.expandedAll("categories"))
    `}
/>

<HeadingLink title="检查记录是否可访问" />
<p>
    要检查自定义客户端请求或用户是否可以访问某条记录，可以使用
    <a href="/jsvm/functions/_app.canAccessRecord.html" target="_blank" rel="noopener noreferrer">
        <code>$app.canAccessRecord(record, requestInfo, rule)</code>
    </a>
    方法。
</p>
<p>
    下面是一个创建自定义路由以获取单篇文章并检查请求是否满足记录集合 View API 规则的示例：
</p>
<CodeBlock
    language="javascript"
    content={`
        routerAdd("GET", "/articles/{slug}", (e) => {
            let slug = e.request.pathValue("slug")

            let record = e.app.findFirstRecordByData("articles", "slug", slug)

            let canAccess = e.app.canAccessRecord(record, e.requestInfo(), record.collection().viewRule)
            if (!canAccess) {
                throw new ForbiddenError()
            }

            return e.json(200, record)
        })
    `}
/>

<HeadingLink title="生成和验证令牌" />
<p>
    PocketBase Web API 完全是无状态的（即没有传统意义上的会话），只要请求中包含有效的
    <code>Authorization: TOKEN</code>
    头部，认证记录就会被视为已认证
    <em>
        （另见 <a href="/docs/js-routing/#builtin-middlewares">内置认证中间件</a> 和
        <a href="/docs/js-routing/#retrieving-the-current-auth-state">
            路由中获取当前认证状态
        </a>
        ）
    </em>
    。
</p>
<p>
    如果你想手动签发和验证记录 JWT（认证、验证、重置密码等），可以使用记录令牌类型相关的方法：
</p>
<CodeBlock
    language="javascript"
    content={`
        let token = record.newAuthToken()

        let token = record.newVerificationToken()

        let token = record.newPasswordResetToken()

        let token = record.newEmailChangeToken(newEmail)

        let token = record.newFileToken() // for protected files

        let token = record.newStaticAuthToken(optCustomDuration) // non-refreshable auth token
    `}
/>
<p>
    每种令牌类型都有自己的密钥，令牌有效期通过其类型相关的集合认证选项进行管理
    （<em>唯一的例外是 <code>newStaticAuthToken</code></em>）。
</p>
<p>
    要验证记录令牌，可以使用
    <a href="/jsvm/functions/_app.findAuthRecordByToken.html" target="_blank" rel="noopener noreferrer">
        <code>$app.findAuthRecordByToken</code>
    </a>
    方法。只有令牌未过期且签名有效时，才会返回相关认证记录。
</p>
<p>以下是验证认证令牌的示例：</p>
<CodeBlock
    language="javascript"
    content={`
        let record = $app.findAuthRecordByToken("YOUR_TOKEN", "auth")
    `}
/>

