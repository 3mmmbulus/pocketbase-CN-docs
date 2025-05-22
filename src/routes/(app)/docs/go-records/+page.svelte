<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import TransactionInfoGo from "../TransactionInfoGo.svelte";
</script>

<p>
    使用 PocketBase 作为框架时，最常见的任务可能就是查询和操作你的 collection 记录。
</p>
<p>
    你可以在
    <a href="{import.meta.env.PB_GODOC_URL}/core#Record" target="_blank" rel="noopener noreferrer">
        <code>core.Record</code>
    </a>
    中找到所有支持的 Record 模型方法的详细文档，下面是一些最常用方法的示例。
</p>

<Toc />

<HeadingLink title="设置字段值" />
<CodeBlock
    language="go"
    content={`
        // sets the value of a single record field
        // (field type specific modifiers are also supported)
        record.Set("title", "example")
        record.Set("users+", "6jyr1y02438et52") // append to existing value

        // populates a record from a data map
        // (calls Set for each entry of the map)
        record.Load(data)
    `}
/>

<HeadingLink title="获取字段值" />
<CodeBlock
    language="go"
    content={`
        // retrieve a single record field value
        // (field specific modifiers are also supported)
        record.Get("someField")            // -> any (without cast)
        record.GetBool("someField")        // -> cast to bool
        record.GetString("someField")      // -> cast to string
        record.GetInt("someField")         // -> cast to int
        record.GetFloat("someField")       // -> cast to float64
        record.GetDateTime("someField")    // -> cast to types.DateTime
        record.GetStringSlice("someField") // -> cast to []string

        // retrieve the new uploaded files
        // (e.g. for inspecting and modifying the file(s) before save)
        record.GetUnsavedFiles("someFileField")

        // unmarshal a single "json" field value into the provided result
        record.UnmarshalJSONField("someJSONField", &result)

        // retrieve a single or multiple expanded data
        record.ExpandedOne("author")     // -> nil|*core.Record
        record.ExpandedAll("categories") // -> []*core.Record

        // export all the public safe record fields as map[string]any
        // (note: "json" type field values are exported as types.JSONRaw bytes slice)
        record.PublicExport()
    `}
/>

<HeadingLink title="认证字段访问器" />
<CodeBlock
    language="go"
    content={`
        record.IsSuperuser() // alias for record.Collection().Name == "_superusers"

        record.Email()         // alias for record.Get("email")
        record.SetEmail(email) // alias for record.Set("email", email)

        record.Verified()         // alias for record.Get("verified")
        record.SetVerified(false) // alias for record.Set("verified", false)

        record.TokenKey()        // alias for record.Get("tokenKey")
        record.SetTokenKey(key)  // alias for record.Set("tokenKey", key)
        record.RefreshTokenKey() // alias for record.Set("tokenKey:autogenerate", "")

        record.ValidatePassword(pass)
        record.SetPassword(pass)   // alias for record.Set("password", pass)
        record.SetRandomPassword() // sets cryptographically random 30 characters string as password
    `}
/>

<HeadingLink title="副本" />
<CodeBlock
    language="go"
    content={`
        // returns a shallow copy of the current record model populated
        // with its ORIGINAL db data state and everything else reset to the defaults
        // (usually used for comparing old and new field values)
        record.Original()

        // returns a shallow copy of the current record model populated
        // with its LATEST data state and everything else reset to the defaults
        // (aka. no expand, no custom fields and with default visibility flags)
        record.Fresh()

        // returns a shallow copy of the current record model populated
        // with its ALL collection and custom fields data, expand and visibility flags
        record.Clone()
    `}
/>

<HeadingLink title="隐藏/显示字段" />
<p>
    可以在后台将 Collection 字段标记为“隐藏”，以防止普通用户访问该字段的值。
</p>
<p>
    Record 模型还提供了进一步控制字段序列化可见性的选项，除了“隐藏”字段选项外，还可以使用
    <a href="{import.meta.env.PB_GODOC_URL}/core#Record.Hide" target="_blank" rel="noopener noreferrer">
        <code>record.Hide(fieldNames...)</code>
    </a>
    和
    <a href="{import.meta.env.PB_GODOC_URL}/core#Record.Unhide" target="_blank" rel="noopener noreferrer">
        <code>record.Unhide(fieldNames...)</code>
    </a>
    方法。
</p>
<p>
    通常 <code>Hide/Unhide</code> 方法会与 <code>OnRecordEnrich</code> 钩子结合使用，该钩子会在每次记录富集（列表、查看、创建、更新、实时变更等）时调用。例如：
</p>
<CodeBlock
    language="go"
    content={`
        app.OnRecordEnrich("articles").BindFunc(func(e *core.RecordEnrichEvent) error {
            // dynamically show/hide a record field depending on whether the current
            // authenticated user has a certain "role" (or any other field constraint)
            if e.RequestInfo.Auth == nil ||
                (!e.RequestInfo.Auth.IsSuperuser() && e.RequestInfo.Auth.GetString("role") != "staff") {
                e.Record.Hide("someStaffOnlyField")
            }

            return e.Next()
        })
    `}
/>
<div class="alert alert-info m-t-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            对于不属于记录 collection schema 的自定义字段，必须显式调用
            <code>record.WithCustomData(true)</code> 才能在公共序列化中允许它们。
        </p>
    </div>
</div>

<HeadingLink title="获取记录" />

<HeadingLink title="获取单条记录" tag="h5" />
<p class="txt-hint">
    所有单条记录检索方法在未找到记录时返回 <code>nil</code> 和 <code>sql.ErrNoRows</code> 错误。
</p>
<CodeBlock
    language="go"
    content={`
        // retrieve a single "articles" record by its id
        record, err := app.FindRecordById("articles", "RECORD_ID")

        // retrieve a single "articles" record by a single key-value pair
        record, err := app.FindFirstRecordByData("articles", "slug", "test")

        // retrieve a single "articles" record by a string filter expression
        // (NB! use "{:placeholder}" to safely bind untrusted user input parameters)
        record, err := app.FindFirstRecordByFilter(
            "articles",
            "status = 'public' && category = {:category}",
            dbx.Params{ "category": "news" },
        )
    `}
/>

<HeadingLink title="获取多条记录" tag="h5" />
<p class="txt-hint">
    所有多条记录检索方法在未找到记录时返回空切片和 <code>nil</code> 错误。
</p>
<CodeBlock
    language="go"
    content={`
        // retrieve multiple "articles" records by their ids
        records, err := app.FindRecordsByIds("articles", []string{"RECORD_ID1", "RECORD_ID2"})

        // retrieve the total number of "articles" records in a collection with optional dbx expressions
        totalPending, err := app.CountRecords("articles", dbx.HashExp{"status": "pending"})

        // retrieve multiple "articles" records with optional dbx expressions
        records, err := app.FindAllRecords("articles",
            dbx.NewExp("LOWER(username) = {:username}", dbx.Params{"username": "John.Doe"}),
            dbx.HashExp{"status": "pending"},
        )

        // retrieve multiple paginated "articles" records by a string filter expression
        // (NB! use "{:placeholder}" to safely bind untrusted user input parameters)
        records, err := app.FindRecordsByFilter(
            "articles",                                    // collection
            "status = 'public' && category = {:category}", // filter
            "-published",                                   // sort
            10,                                            // limit
            0,                                             // offset
            dbx.Params{ "category": "news" },              // optional filter params
        )
    `}
/>

<HeadingLink title="获取认证记录" tag="h5" />
<CodeBlock
    language="go"
    content={`
        // retrieve a single auth record by its email
        user, err := app.FindAuthRecordByEmail("users", "test@example.com")

        // retrieve a single auth record by JWT
        // (you could also specify an optional list of accepted token types)
        user, err := app.FindAuthRecordByToken("YOUR_TOKEN", core.TokenTypeAuth)
    `}
/>

<HeadingLink title="自定义记录查询" tag="h5" />
<p>
    除了上述查询助手外，你还可以使用
    <a href="{import.meta.env.PB_GODOC_URL}/core#RecordQuery" target="_blank" rel="noopener noreferrer">
        <code>RecordQuery(collection)</code>
    </a>
    方法创建自定义 Record 查询。它返回一个 SELECT DB 构建器，可与
    <a href="/docs/go-database">数据库指南</a>
    中描述的方法一起使用。
</p>
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/dbx"
            "github.com/pocketbase/pocketbase/core"
        )

        ...

        func FindActiveArticles(app core.App) ([]*core.Record, error) {
            records := []*core.Record{}

            err := app.RecordQuery("articles").
                AndWhere(dbx.HashExp{"status": "active"}).
                OrderBy("published DESC").
                Limit(10).
                All(&records)

            if err != nil {
                return nil, err
            }

            return records, nil
        }
    `}
/>

<HeadingLink title="创建新记录" />

<HeadingLink title="以编程方式创建新记录" tag="h5" />
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tools/filesystem"
        )

        ...

        collection, err := app.FindCollectionByNameOrId("articles")
        if err != nil {
            return err
        }

        record := core.NewRecord(collection)

        record.Set("title", "Lorem ipsum")
        record.Set("active", true)

        // field type specific modifiers can also be used
        record.Set("slug:autogenerate", "post-")

        // new files must be one or a slice of *filesystem.File values
        //
        // note1: see all factories in ` +
        import.meta.env.PB_GODOC_URL +
        `/tools/filesystem#File
        // note2: for reading files from a request event you can also use e.FindUploadedFiles("fileKey")
        f1, _ := filesystem.NewFileFromPath("/local/path/to/file1.txt")
        f2, _ := filesystem.NewFileFromBytes([]byte{"test content"}, "file2.txt")
        f3, _ := filesystem.NewFileFromURL(context.Background(), "https://example.com/file3.pdf")
        record.Set("documents", []*filesystem.File{f1, f2, f3})

        // validate and persist
        // (use SaveNoValidate to skip fields validation)
        err = app.Save(record);
        if err != nil {
            return err
        }
    `}
/>

<HeadingLink title="拦截创建请求" tag="h5" />
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/pocketbase/core"
        )

        ...

        app.OnRecordCreateRequest("articles").BindFunc(func(e *core.RecordRequestEvent) error {
            // ignore for superusers
            if e.HasSuperuserAuth() {
                return e.Next()
            }

            // overwrite the submitted "status" field value
            e.Record.Set("status", "pending")

            // or you can also prevent the create event by returning an error
            status := e.Record.GetString("status")
            if (status != "pending" &&
                // guest or not an editor
                (e.Auth == nil || e.Auth.GetString("role") != "editor")) {
                return e.BadRequestError("Only editors can set a status different from pending", nil)
            }

            return e.Next()
        })
    `}
/>

<HeadingLink title="更新已有记录" />

<HeadingLink title="以编程方式更新已有记录" tag="h5" />
<CodeBlock
    language="go"
    content={`
        record, err := app.FindRecordById("articles", "RECORD_ID")
        if err != nil {
            return err
        }

        record.Set("title", "Lorem ipsum")

        // delete existing record files by specifying their file names
        record.Set("documents-", []string{"file1_abc123.txt", "file3_abc123.txt"})

        // append one or more new files to the already uploaded list
        //
        // note1: see all factories in ` +
        import.meta.env.PB_GODOC_URL +
        `/tools/filesystem#File
        // note2: for reading files from a request event you can also use e.FindUploadedFiles("fileKey")
        f1, _ := filesystem.NewFileFromPath("/local/path/to/file1.txt")
        f2, _ := filesystem.NewFileFromBytes([]byte{"test content"}, "file2.txt")
        f3, _ := filesystem.NewFileFromURL(context.Background(), "https://example.com/file3.pdf")
        record.Set("documents+", []*filesystem.File{f1, f2, f3})

        // validate and persist
        // (use SaveNoValidate to skip fields validation)
        err = app.Save(record);
        if err != nil {
            return err
        }
    `}
/>

<HeadingLink title="拦截更新请求" tag="h5" />
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/pocketbase/core"
        )

        ...

        app.OnRecordUpdateRequest("articles").Add(func(e *core.RecordRequestEvent) error {
            // ignore for superusers
            if e.HasSuperuserAuth() {
                return e.Next()
            }

            // overwrite the submitted "status" field value
            e.Record.Set("status", "pending")

            // or you can also prevent the create event by returning an error
            status := e.Record.GetString("status")
            if (status != "pending" &&
                // guest or not an editor
                (e.Auth == nil || e.Auth.GetString("role") != "editor")) {
                return e.BadRequestError("Only editors can set a status different from pending", nil)
            }

            return e.Next()
        })
    `}
/>

<HeadingLink title="删除记录" />
<CodeBlock
    language="go"
    content={`
        record, err := app.FindRecordById("articles", "RECORD_ID")
        if err != nil {
            return err
        }

        err = app.Delete(record)
        if err != nil {
            return err
        }
    `}
/>

<HeadingLink title="事务" />
<TransactionInfoGo />
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/pocketbase/core"
        )

        ...

        titles := []string{"title1", "title2", "title3"}

        collection, err := app.FindCollectionByNameOrId("articles")
        if err != nil {
            return err
        }

        // create new record for each title
        app.RunInTransaction(func(txApp core.App) error {
            for _, title := range titles {
                record := core.NewRecord(collection)
                record.Set("title", title)

                if err := txApp.Save(record); err != nil {
                    return err
                }
            }

            return nil
        })
    `}
/>

<HeadingLink title="以编程方式展开关联关系" />
<p>
    要以编程方式展开记录关联关系，可以使用
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.ExpandRecord"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.ExpandRecord(record, expands, optFetchFunc)</code>
    </a>
    展开单条记录，或
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.ExpandRecords"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.ExpandRecords(records, expands, optFetchFunc)</code>
    </a>
    展开多条记录。
</p>
<p>
    加载后，你可以通过
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#Record.ExpandedOne"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>record.ExpandedOne(relName)</code>
    </a>
    或
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#Record.ExpandedAll"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>record.ExpandedAll(relName)</code>
    </a>
    访问已展开的关联数据。
</p>
<p>例如：</p>
<CodeBlock
    language="go"
    content={`
        record, err := app.FindFirstRecordByData("articles", "slug", "lorem-ipsum")
        if err != nil {
            return err
        }

        // expand the "author" and "categories" relations
        errs := app.ExpandRecord(record, []string{"author", "categories"}, nil)
        if len(errs) > 0 {
            return fmt.Errorf("failed to expand: %v", errs)
        }

        // print the expanded records
        log.Println(record.ExpandedOne("author"))
        log.Println(record.ExpandedAll("categories"))
    `}
/>

<HeadingLink title="检查记录是否可访问" />
<p>
    要检查自定义客户端请求或用户是否可以访问某条记录，可以使用
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.CanAccessRecord"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.CanAccessRecord(record, requestInfo, rule)</code>
    </a>
    方法。
</p>
<p>
    下面是一个创建自定义路由以获取单篇文章并检查请求是否满足记录 collection 的 View API 规则的示例：
</p>
<CodeBlock
    language="go"
    content={`
        package main

        import (
            "log"
            "net/http"

            "github.com/pocketbase/pocketbase"
            "github.com/pocketbase/pocketbase/core"
        )

        func main() {
            app := pocketbase.New()

            app.OnServe().BindFunc(func(se *core.ServeEvent) error {
                se.Router.GET("/articles/{slug}", func(e *core.RequestEvent) error {
                    slug := e.Request.PathValue("slug")

                    record, err := e.App.FindFirstRecordByData("articles", "slug", slug)
                    if err != nil {
                        return e.NotFoundError("Missing or invalid slug", err)
                    }

                    info, err := e.RequestInfo()
                    if err != nil {
                        return e.BadRequestError("Failed to retrieve request info", err)
                    }

                    canAccess, err := e.App.CanAccessRecord(record, info, record.Collection().ViewRule)
                    if !canAccess {
                        return e.ForbiddenError("", err)
                    }

                    return e.JSON(http.StatusOK, record)
                })

                return se.Next()
            })

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>

<HeadingLink title="生成和验证令牌" />
<p>
    PocketBase Web API 完全是无状态的（即没有传统意义上的会话），当请求中包含有效的
    <code>Authorization: TOKEN</code>
    头时，认证记录即被视为已认证
    <em>
        （另见 <a href="/docs/go-routing/#builtin-middlewares">内置认证中间件</a> 和
        <a href="/docs/go-routing/#retrieving-the-current-auth-state">
            路由中获取当前认证状态
        </a>
        ）
    </em>
    。
</p>
<p>
    如果你想手动签发和验证记录 JWT（auth、verification、password reset 等），可以使用记录类型专用的方法：
</p>
<CodeBlock
    language="go"
    content={`
        token, err := record.NewAuthToken()

        token, err := record.NewVerificationToken()

        token, err := record.NewPasswordResetToken()

        token, err := record.NewEmailChangeToken(newEmail)

        token, err := record.NewFileToken() // for protected files

        token, err := record.NewStaticAuthToken(optCustomDuration) // non-refreshable auth token
    `}
/>
<p>
    每种令牌类型都有自己的密钥，令牌的有效期通过其类型相关的 collection 认证选项进行管理（<em>唯一的例外是 <code>NewStaticAuthToken</code></em>）。
</p>
<p>
    要验证记录令牌，可以使用
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.FindAuthRecordByToken"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.FindAuthRecordByToken</code>
    </a>
    方法。只有当令牌未过期且签名有效时，才会返回相关的认证记录。
</p>
<p>以下是验证认证令牌的示例：</p>
<CodeBlock
    language="go"
    content={`
        record, err := app.FindAuthRecordByToken("YOUR_TOKEN", core.TokenTypeAuth)
    `}
/>
