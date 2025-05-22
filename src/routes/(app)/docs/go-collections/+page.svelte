<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import fieldNames from "../field_names.js";
</script>

<p>
    通常你可以通过管理后台管理集合，但在某些场景下你可能希望以编程方式创建或编辑集合（通常作为
    <a href="/docs/go-migrations">数据库迁移</a> 的一部分）。你可以在
    <a href="{import.meta.env.PB_GODOC_URL}/core#App" target="_blank" rel="noopener noreferrer">
        <code>core.App</code>
    </a>
    和
    <a href="{import.meta.env.PB_GODOC_URL}/core#Collection" target="_blank" rel="noopener noreferrer">
        <code>core.Collection</code>
    </a>
    中找到所有可用的集合相关操作和方法，下面列出了一些最常用的方法：
</p>

<Toc />

<HeadingLink title="获取集合" />

<HeadingLink title="获取单个集合" tag="h5" />
<p class="txt-hint">
    所有单个集合的获取方法在未找到集合时会返回 <code>nil</code> 和 <code>sql.ErrNoRows</code> 错误。
</p>
<CodeBlock
    language="go"
    content={`
        collection, err := app.FindCollectionByNameOrId("example")
    `}
/>

<HeadingLink title="获取多个集合" tag="h5" />
<p class="txt-hint">
    所有获取多个集合的方法在未找到集合时会返回空切片和 <code>nil</code> 错误。
</p>
<CodeBlock
    language="go"
    content={`
        allCollections, err := app.FindAllCollections()

        authAndViewCollections, err := app.FindAllCollections(core.CollectionTypeAuth, core.CollectionTypeView)
    `}
/>

<HeadingLink title="自定义集合查询" tag="h5" />
<p>
    除了上述查询助手外，你还可以使用
    <a href="{import.meta.env.PB_GODOC_URL}/core#CollectionQuery" target="_blank" rel="noopener noreferrer">
        <code>CollectionQuery()</code>
    </a>
    方法自定义集合查询。它返回一个 SELECT 数据库构造器，可与
    <a href="/docs/go-database">数据库指南</a>
    中描述的方法配合使用。
</p>
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/dbx"
            "github.com/pocketbase/pocketbase/core"
        )

        ...

        func FindSystemCollections(app core.App) ([]*core.Collection, error) {
            collections := []*core.Collection{}

            err := app.CollectionQuery().
                AndWhere(dbx.HashExp{"system": true}).
                OrderBy("created DESC").
                All(&collections)

            if err != nil {
                return nil, err
            }

            return collections, nil
        }
    `}
/>

<HeadingLink title="集合属性" />
<!-- note: listed temporary until godoc adds support for promoting the public fields and method of embedded unexported types -->
<!-- prettier-ignore -->
<CodeBlock
    language="go"
    content={`
        Id      string
        Name    string
        Type    string // "base", "view", "auth"
        System  bool // !prevent collection rename, deletion and rules change of internal collections like _superusers
        Fields  core.FieldsList
        Indexes types.JSONArray[string]
        Created types.DateTime
        Updated types.DateTime

        // CRUD rules
        ListRule   *string
        ViewRule   *string
        CreateRule *string
        UpdateRule *string
        DeleteRule *string

        // "view" type specific options
        // (see ` + import.meta.env.PB_REPO_URL + `/blob/master/core/collection_model_view_options.go)
        ViewQuery string

        // "auth" type specific options
        // (see ` + import.meta.env.PB_REPO_URL + `/blob/master/core/collection_model_auth_options.go)
        AuthRule                   *string
        ManageRule                 *string
        AuthAlert                  core.AuthAlertConfig
        OAuth2                     core.OAuth2Config
        PasswordAuth               core.PasswordAuthConfig
        MFA                        core.MFAConfig
        OTP                        core.OTPConfig
        AuthToken                  core.TokenConfig
        PasswordResetToken         core.TokenConfig
        EmailChangeToken           core.TokenConfig
        VerificationToken          core.TokenConfig
        FileToken                  core.TokenConfig
        VerificationTemplate       core.EmailTemplate
        ResetPasswordTemplate      core.EmailTemplate
        ConfirmEmailChangeTemplate core.EmailTemplate
    `}
/>

<HeadingLink title="字段定义" />
<ul>
    {#each fieldNames as field}
        <li>
            <a href="{import.meta.env.PB_GODOC_URL}/core#{field}" target="_blank" rel="noopener noreferrer">
                <code>core.{field}</code>
            </a>
        </li>
    {/each}
</ul>

<HeadingLink title="创建新集合" />
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tools/types"
        )

        ...

        // core.NewAuthCollection("example")
        // core.NewViewCollection("example")
        collection := core.NewBaseCollection("example")

        // set rules
        collection.ViewRule = types.Pointer("@request.auth.id != ''")
        collection.CreateRule = types.Pointer("@request.auth.id != '' && @request.body.user = @request.auth.id")
        collection.UpdateRule = types.Pointer(` +
        "`" +
        `
            @request.auth.id != '' &&
            user = @request.auth.id &&
            (@request.body.user:isset = false || @request.body.user = @request.auth.id)
        ` +
        "`" +
        `)

        // add text field
        collection.Fields.Add(&core.TextField{
            Name:     "title",
            Required: true,
            Max:      100,
        })

        // add relation field
        usersCollection, err := app.FindCollectionByNameOrId("users")
        if err != nil {
            return err
        }
        collection.Fields.Add(&core.RelationField{
            Name:          "user",
            Required:      true,
            Max:           100,
            CascadeDelete: true,
            CollectionId:  usersCollection.Id,
        })

        // add autodate/timestamp fields (created/updated)
        collection.Fields.Add(&core.AutodateField{
            Name:     "created",
            OnCreate: true,
        })
        collection.Fields.Add(&core.AutodateField{
            Name:     "updated",
            OnCreate: true,
            OnUpdate: true,
        })

        // or: collection.Indexes = []string{"CREATE UNIQUE INDEX idx_example_user ON example (user)"}
        collection.AddIndex("idx_example_user", true, "user", "")

        // validate and persist
        // (use SaveNoValidate to skip fields validation)
        err = app.Save(collection)
        if err != nil {
            return err
        }
    `}
/>

<HeadingLink title="更新已有集合" />
<CodeBlock
    language="go"
    content={`
        import (
            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tools/types"
        )

        ...

        collection, err := app.FindCollectionByNameOrId("example")
        if err != nil {
            return err
        }

        // change rule
        collection.DeleteRule = types.Pointer("@request.auth.id != ''")

        // add new editor field
        collection.Fields.Add(&core.EditorField{
            Name:     "description",
            Required: true,
        })

        // change existing field
        // (returns a pointer and direct modifications are allowed without the need of reinsert)
        titleField := collection.Fields.GetByName("title")
        titleField.Min = 10

        // or: collection.Indexes = append(collection.Indexes, "CREATE INDEX idx_example_title ON example (title)")
        collection.AddIndex("idx_example_title", false, "title", "")

        // validate and persist
        // (use SaveNoValidate to skip fields validation)
        err = app.Save(collection)
        if err != nil {
            return err
        }
    `}
/>

<HeadingLink title="删除集合" />
<CodeBlock
    language="go"
    content={`
        collection, err := app.FindCollectionByNameOrId("example")
        if err != nil {
            return err
        }

        err = app.Delete(collection)
        if err != nil {
            return err
        }
    `}
/>
