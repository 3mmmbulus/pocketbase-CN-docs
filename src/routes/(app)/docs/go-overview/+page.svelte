<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Accordion from "@/components/Accordion.svelte";
    import HeadingLink from "@/components/HeadingLink.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<Toc />

<HeadingLink title="快速开始" />
<p>
    PocketBase 可以作为常规 Go 包使用，提供多种辅助方法和钩子，帮助你实现自定义的可移植应用。
</p>
<p>
    你可以通过
    <a href="{import.meta.env.PB_GODOC_URL}#New" target="_blank" rel="noopener noreferrer">
        <code>pocketbase.New()</code>
    </a>
    或
    <a href="{import.meta.env.PB_GODOC_URL}#NewWithConfig" target="_blank" rel="noopener noreferrer">
        <code>pocketbase.NewWithConfig(config)</code>
    </a>
    创建一个新的 PocketBase 实例。
</p>
<p>
    实例创建后，你可以通过可用的
    <a href="/docs/go-event-hooks/">事件钩子</a>
    注册自定义业务逻辑，并调用
    <a href="{import.meta.env.PB_GODOC_URL}#PocketBase.Start" target="_blank" rel="noopener noreferrer">
        <code>app.Start()</code>
    </a>
    启动应用。
</p>

<p>下面是一个最简示例：</p>
<ol start="0">
    <li>
        <a href="https://go.dev/doc/install" target="_blank" rel="noreferrer noopener">安装 Go 1.23+</a>
    </li>
    <li>
        <p>
            新建一个项目目录，并在其中创建 <code>main.go</code> 文件。
            <br />
            <small class="txt-hint txt-sm">
                你也可以参考预构建可执行文件的
                <a
                    href="{import.meta.env.PB_REPO_URL}/blob/master/examples/base/main.go"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <code class="txt-sm">example/base/main.go</code>
                </a>
                文件。
            </small>
        </p>
        <CodeBlock
            language="go"
            content={`
                package main

                import (
                    "log"
                    "os"

                    "github.com/pocketbase/pocketbase"
                    "github.com/pocketbase/pocketbase/apis"
                    "github.com/pocketbase/pocketbase/core"
                )

                func main() {
                    app := pocketbase.New()

                    app.OnServe().BindFunc(func(se *core.ServeEvent) error {
                        // serves static files from the provided public dir (if exists)
                        se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

                        return se.Next()
                    })

                    if err := app.Start(); err != nil {
                        log.Fatal(err)
                    }
                }
            `}
        />
    </li>
    <li>初始化依赖，运行 <code>go mod init myapp && go mod tidy</code>。</li>
    <li>启动应用，运行 <code>go run . serve</code>。</li>
    <li>
        若要构建静态链接的可执行文件，运行 <code>go build</code>
        ，然后你可以通过
        <code>./myapp serve</code>
        启动生成的可执行文件。
    </li>
</ol>

<HeadingLink title="自定义 SQLite 驱动" />
<div class="alert alert-info" id="cgo_note">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            <strong>一般推荐使用内置的 SQLite 配置</strong>，但如果你需要更高级的配置或扩展（如 ICU、FTS5 等），则需要指定自定义驱动或构建方式。
        </p>
        <p>
            注意，PocketBase 默认不需要 CGO，因为它使用纯 Go 实现的 SQLite
            <a href="https://pkg.go.dev/modernc.org/sqlite" target="_blank" rel="noreferrer noopener">
                modernc.org/sqlite
            </a>，但如果你使用自定义 SQLite 驱动则可能不是这种情况！
        </p>
    </div>
</div>
<p>
    PocketBase v0.23+ 支持通过 app 配置定义 <code>DBConnect</code> 函数，以加载兼容标准 Go <code>database/sql</code> 的自定义 SQLite 构建和驱动。
</p>
<p>
    <strong><code>DBConnect</code> 函数会被调用两次</strong> —— 一次用于
    <code>pb_data/data.db</code>
    （主数据库文件），另一次用于 <code>pb_data/auxiliary.db</code>（用于日志和其他临时系统元信息）。
</p>
<p>
    如果你希望按条件加载自定义驱动并回退到默认处理器，可以调用
    <a href="{import.meta.env.PB_GODOC_URL}/core#DefaultDBConnect" target="_blank" rel="noreferrer noopener">
        <code>core.DefaultDBConnect</code>
    </a>
    。
    <br />
    <em class="txt-sm txt-hint">
        补充说明：如果你不打算在自定义驱动注册中使用 <code class="txt-sm">core.DefaultDBConnect</code>
        作为回退，可以通过 <code class="txt-sm">go build -tags no_default_driver</code> 排除默认纯 Go 驱动，以略微减小二进制体积（约 4MB）。
    </em>
</p>
<p>下方是常用外部 SQLite 驱动的最简用法示例：</p>

<div class="accordions m-t-sm">
    <Accordion single title="github.com/mattn/go-sqlite3">
        <p>
            <em>
                所有可用选项请参考
                <a href="https://github.com/mattn/go-sqlite3" target="_blank" rel="noopener noreferrer">
                    <code>github.com/mattn/go-sqlite3</code>
                </a>
                的 README。
            </em>
        </p>
        <!-- prettier-ignore -->
        <CodeBlock
            language="go"
            content={`
                package main

                import (
                    "database/sql"
                    "log"

                    "github.com/mattn/go-sqlite3"
                    "github.com/pocketbase/dbx"
                    "github.com/pocketbase/pocketbase"
                )

                // register a new driver with default PRAGMAs and the same query
                // builder implementation as the already existing sqlite3 builder
                func init() {
                    // initialize default PRAGMAs for each new connection
                    sql.Register("pb_sqlite3",
                        &sqlite3.SQLiteDriver{
                            ConnectHook: func(conn *sqlite3.SQLiteConn) error {
                                _, err := conn.Exec(` + "`" + `
                                    PRAGMA busy_timeout       = 10000;
                                    PRAGMA journal_mode       = WAL;
                                    PRAGMA journal_size_limit = 200000000;
                                    PRAGMA synchronous        = NORMAL;
                                    PRAGMA foreign_keys       = ON;
                                    PRAGMA temp_store         = MEMORY;
                                    PRAGMA cache_size         = -16000;
                                ` + "`" + `, nil)

                                return err
                            },
                        },
                    )

                    dbx.BuilderFuncMap["pb_sqlite3"] = dbx.BuilderFuncMap["sqlite3"]
                }

                func main() {
                    app := pocketbase.NewWithConfig(pocketbase.Config{
                        DBConnect: func(dbPath string) (*dbx.DB, error) {
                            return dbx.Open("pb_sqlite3", dbPath)
                        },
                    })

                    // any custom hooks or plugins...

                    if err := app.Start(); err != nil {
                        log.Fatal(err)
                    }
                }
            `}
        />
    </Accordion>
    <Accordion single title="github.com/ncruces/go-sqlite3">
        <p>
            <em>
                所有可用选项请参考
                <a href="https://github.com/ncruces/go-sqlite3" target="_blank" rel="noopener noreferrer">
                    <code>github.com/ncruces/go-sqlite3</code>
                </a>
                的 README。
            </em>
        </p>
        <CodeBlock
            language="go"
            content={`
                package main

                import (
                    "log"

                    "github.com/pocketbase/dbx"
                    "github.com/pocketbase/pocketbase"

                    _ "github.com/ncruces/go-sqlite3/driver"
                    _ "github.com/ncruces/go-sqlite3/embed"
                )

                func main() {
                    app := pocketbase.NewWithConfig(pocketbase.Config{
                        DBConnect: func(dbPath string) (*dbx.DB, error) {
                            const pragmas = "?_pragma=busy_timeout(10000)&_pragma=journal_mode(WAL)&_pragma=journal_size_limit(200000000)&_pragma=synchronous(NORMAL)&_pragma=foreign_keys(ON)&_pragma=temp_store(MEMORY)&_pragma=cache_size(-16000)"

                            return dbx.Open("sqlite3", "file:"+dbPath+pragmas)
                        },
                    })

                    // custom hooks and plugins...

                    if err := app.Start(); err != nil {
                        log.Fatal(err)
                    }
                }
            `}
        />
    </Accordion>
    <Accordion single title="github.com/tursodatabase/libsql-client-go/libsql">
        <p>
            <em>
                所有可用选项请参考
                <a
                    href="https://docs.turso.tech/sdk/go/quickstart#remote-only"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Turso Go 文档
                </a>
                。
            </em>
        </p>
        <CodeBlock
            language="go"
            content={`
                package main

                import (
                    "log"

                    "github.com/pocketbase/dbx"
                    "github.com/pocketbase/pocketbase"
                    "github.com/pocketbase/pocketbase/core"

                    _ "github.com/tursodatabase/libsql-client-go/libsql"
                )

                // register the libsql driver to use the same query builder
                // implementation as the already existing sqlite3 builder
                func init() {
                    dbx.BuilderFuncMap["libsql"] = dbx.BuilderFuncMap["sqlite3"]
                }

                func main() {
                    app := pocketbase.NewWithConfig(pocketbase.Config{
                        DBConnect: func(dbPath string) (*dbx.DB, error) {
                            if strings.Contains(dbPath, "data.db") {
                                return dbx.Open("libsql", "libsql://[data.db DATABASE].turso.io?authToken=[TOKEN]")
                            }

                            // optionally for the logs (aka. pb_data/auxiliary.db) use the default local filesystem driver
                            return core.DefaultDBConnect(dbPath)
                        },
                    })

                    // any custom hooks or plugins...

                    if err := app.Start(); err != nil {
                        log.Fatal(err)
                    }
                }
            `}
        />
    </Accordion>
</div>
