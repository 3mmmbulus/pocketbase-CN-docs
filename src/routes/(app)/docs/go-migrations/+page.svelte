<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<p>
    PocketBase 内置了数据库和数据迁移工具，允许你对数据库结构进行版本管理、以编程方式创建集合、初始化默认设置等。
</p>
<p>
    由于迁移就是普通的 Go 函数，除了应用结构变更外，你还可以用它来调整已有数据以适配新结构，或执行任何只需运行一次的应用特定逻辑。
</p>
<p>
    另外，迁移文件为 <code>.go</code> 文件，这也确保了它们会无缝嵌入到最终的可执行文件中。
</p>

<Toc />

<HeadingLink title="快速上手" />
<HeadingLink title="0. 注册 migrate 命令" tag="h5" />
<p>
    <em>
        所有可用的配置选项可在
        <a href="{import.meta.env.PB_GODOC_URL}/plugins/migratecmd" target="_blank" rel="noopener noreferrer">
            <code>migratecmd</code>
        </a>
        子包中找到。
    </em>
</p>
<CodeBlock
    language="go"
    content={`
        // main.go
        package main

        import (
            "log"
            "strings"

            "github.com/pocketbase/pocketbase"
            "github.com/pocketbase/pocketbase/plugins/migratecmd"

            // enable once you have at least one migration
            // _ "yourpackage/migrations"
        )

        func main() {
            app := pocketbase.New()

            // loosely check if it was executed using "go run"
            isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())

            migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
                // enable auto creation of migration files when making collection changes in the Dashboard
                // (the isGoRun check is to enable it only during development)
                Automigrate: isGoRun,
            })

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>

<HeadingLink title="1. 创建新迁移" tag="h5" />
<p>
    要创建一个空白迁移，可以运行 <code>migrate create</code>。
</p>
<CodeBlock
    content={`
        // Since the "create" command makes sense only during development,
        // it is expected the user to be in the app working directory
        // and to be using "go run"

        [root@dev app]$ go run . migrate create "your_new_migration"
    `}
/>
<div class="clearfix m-t-xs" />
<CodeBlock
    language="go"
    content={`
        // migrations/1655834400_your_new_migration.go
        package migrations

        import (
            "github.com/pocketbase/pocketbase/core"
            m "github.com/pocketbase/pocketbase/migrations"
        )

        func init() {
            m.Register(func(app core.App) error {
                // add up queries...

                return nil
            }, func(app core.App) error {
                // add down queries...

                return nil
            })
        }
    `}
/>
<p>
    上述操作会在默认的 <code>migrations</code> 目录下创建一个新的空白迁移文件。
</p>
<p>每个迁移文件应只包含一次 <code>m.Register(upFunc, downFunc)</code> 调用。</p>
<p>
    在迁移文件中，你应在 <code>upFunc</code> 回调中编写“升级”代码。
    <br />
    <code>downFunc</code> 是可选的，应包含用于回滚 <code>upFunc</code> 变更的“降级”操作。
    <br />
    两个回调都接收一个带事务的 <code>core.App</code> 实例。
</p>

<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            你可以查阅
            <a href="/docs/go-database">数据库指南</a>、
            <a href="/docs/go-collections">集合操作</a> 和
            <a href="/docs/go-records">记录操作</a>
            以了解更多与数据库交互的细节。你还可以在本指南下方找到
            <a href="#examples">一些示例</a>。
        </p>
    </div>
</div>

<HeadingLink title="2. 加载迁移" tag="h5" />
<p class="txt-bold">
    为了让你的应用识别已注册的迁移，你需要在某个 <code>main</code> 包文件中导入上述
    <code>migrations</code> 包：
</p>
<CodeBlock
    language="go"
    content={`
        package main

        import _ "yourpackage/migrations"

        // ...
    `}
/>

<HeadingLink title="3. 执行迁移" tag="h5" />
<p class="txt-bold">
    新的未应用迁移会在应用服务器启动时自动执行，即 <code>serve</code> 时。
</p>
<p>
    你也可以通过运行 <code>migrate up</code> 手动应用新迁移。
    <br />
    若要回滚最近应用的迁移，可以运行 <code>migrate down [number]</code>。
    <br />
    <small class="txt-hint">
        手动应用或回滚迁移后，需要重启 <code>serve</code> 进程以刷新缓存的集合状态。
    </small>
</p>

<HeadingLink title="集合快照" />
<p>
    <code>migrate collections</code> 命令会生成你当前集合配置的完整快照，无需手动输入。与 <code>migrate create</code> 命令类似，这会在
    <code>migrations</code> 目录下生成一个新的迁移文件。
</p>
<CodeBlock
    content={`
        // Since the "collections" command makes sense only during development,
        // it is expected the user to be in the app working directory
        // and to be using "go run"

        [root@dev app]$ go run . migrate collections
    `}
/>
<p>
    默认情况下，集合快照以 <em>extend</em> 模式导入，这意味着快照中不存在的集合和字段会被保留。如果你希望快照能<em>删除</em>缺失的集合和字段，可以编辑生成的文件，将
    <code>ImportCollectionsByMarshaledJSON</code> 方法的最后一个参数改为 <code>true</code>。
</p>

<HeadingLink title="迁移历史" />
<p>
    所有已应用的迁移文件名都会存储在内部 <code>_migrations</code> 表中。
    <br />
    本地开发时，你可能会多次修改集合以测试不同方案。
    <br />
    启用 <code>Automigrate</code> 时，这可能导致迁移历史中出现许多不必要的中间步骤，这些步骤在最终迁移历史中可能并不需要。
</p>
<p>
    为了避免混乱并防止在生产环境中应用这些中间步骤，你可以手动删除（或合并）不需要的迁移文件，然后运行以下命令更新本地迁移历史：
</p>
<CodeBlock content={`[root@dev app]$ go run . migrate history-sync`} />
<p>
    上述命令会移除 <code>_migrations</code> 表中没有对应迁移文件的所有条目。
</p>

<HeadingLink title="示例" />

<HeadingLink title="执行原生 SQL 语句" tag="h5" />
<CodeBlock
    language="go"
    content={`
        // migrations/1687801090_set_pending_status.go
        package migrations

        import (
            "github.com/pocketbase/pocketbase/core"
            m "github.com/pocketbase/pocketbase/migrations"
        )

        // set a default "pending" status to all empty status articles
        func init() {
            m.Register(func(app core.App) error {
                _, err := app.DB().NewQuery("UPDATE articles SET status = 'pending' WHERE status = ''").Execute()
                return err
            }, nil)
        }
    `}
/>

<HeadingLink title="初始化默认应用设置" tag="h5" />
<CodeBlock
    language="go"
    content={`
        // migrations/1687801090_initial_settings.go
        package migrations

        import (
            "github.com/pocketbase/pocketbase/core"
            m "github.com/pocketbase/pocketbase/migrations"
        )

        func init() {
            m.Register(func(app core.App) error {
                settings := app.Settings()

                // for all available settings fields you could check
                // https://github.com/pocketbase/pocketbase/blob/develop/core/settings_model.go#L121-L130
                settings.Meta.AppName = "test"
                settings.Meta.AppURL = "https://example.com"
                settings.Logs.MaxDays = 2
                settings.Logs.LogAuthId = true
                settings.Logs.LogIP = false

                return app.Save(settings)
            }, nil)
        }
    `}
/>

<HeadingLink title="创建初始超级用户" tag="h5" />
<p>
    <em>
        所有支持的记录方法可参考
        <a href="/docs/go-records">记录操作</a>
    </em>
    。
</p>
<p>
    <em>
        你也可以通过
        <code>./pocketbase superuser create EMAIL PASS</code>
        命令创建初始超级用户。
    </em>
</p>
<CodeBlock
    language="go"
    content={`
        // migrations/1687801090_initial_superuser.go
        package migrations

        import (
            "github.com/pocketbase/pocketbase/core"
            m "github.com/pocketbase/pocketbase/migrations"
        )

        func init() {
            m.Register(func(app core.App) error {
                superusers, err := app.FindCollectionByNameOrId(core.CollectionNameSuperusers)
                if err != nil {
                    return err
                }

                record := core.NewRecord(superusers)

                // note: the values can be eventually loaded via os.Getenv(key)
                // or from a special local config file
                record.Set("email", "test@example.com")
                record.Set("password", "1234567890")

                return app.Save(record)
            }, func(app core.App) error { // optional revert operation
                record, _ := app.FindAuthRecordByEmail(core.CollectionNameSuperusers, "test@example.com")
                if record == nil {
                    return nil // probably already deleted
                }

                return app.Delete(record)
            })
        }
    `}
/>

<HeadingLink title="以编程方式创建集合" tag="h5" />
<p>
    <em>
        所有支持的集合方法可参考
        <a href="/docs/go-collections">集合操作</a>
    </em>
    。
</p>
<CodeBlock
    language="go"
    content={`
        // migrations/1687801090_create_clients_collection.go
        package migrations

        import (
            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tools/types"

            m "github.com/pocketbase/pocketbase/migrations"
        )

        func init() {
            m.Register(func(app core.App) error {
                // init a new auth collection with the default system fields and auth options
                collection := core.NewAuthCollection("clients")

                // restrict the list and view rules for record owners
                collection.ListRule = types.Pointer("id = @request.auth.id")
                collection.ViewRule = types.Pointer("id = @request.auth.id")

                // add extra fields in addition to the default ones
                collection.Fields.Add(
                    &core.TextField{
                        Name:     "company",
                        Required: true,
                        Max:      100,
                    },
                    &core.URLField{
                        Name:        "website",
                        Presentable: true,
                    },
                )

                // disable password auth and enable OTP only
                collection.PasswordAuth.Enabled = false
                collection.OTP.Enabled = true

                collection.AddIndex("idx_clients_company", false, "company", "")

                return app.Save(collection)
            }, func(app core.App) error { // optional revert operation
                collection, err := app.FindCollectionByNameOrId("clients")
                if err != nil {
                    return err
                }

                return app.Delete(collection)
            })
        }
    `}
/>
