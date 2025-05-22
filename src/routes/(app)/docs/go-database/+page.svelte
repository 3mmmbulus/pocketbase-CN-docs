<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import TransactionInfoGo from "../TransactionInfoGo.svelte";
</script>

<p>
    <a href="{import.meta.env.PB_GODOC_URL}/core#App" target="_blank" rel="noopener noreferrer">
        <code>core.App</code>
    </a>
    是与数据库交互的主要接口。
</p>
<p>
    <code>App.DB()</code> 返回一个 <code>dbx.Builder</code>，可执行各种 SQL 语句，包括原始查询。
</p>
<p>
    下方列出了大多数常见的数据库操作，更多信息可参考
    <a href="https://pkg.go.dev/github.com/pocketbase/dbx" target="_blank" rel="noopener noreferrer">
        dbx package godoc
    </a>。
</p>
<div class="alert alert-info">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            如需了解如何以编程方式操作 Record 和 Collection 模型的更多细节和示例，也可参阅 <a href="/docs/go-collections">集合操作</a>
            和
            <a href="/docs/go-records">记录操作</a> 章节。
        </p>
    </div>
</div>

<Toc />

<HeadingLink title="执行查询" />
<p>
    执行数据库查询时，可以从 <code>NewQuery("...")</code> 语句开始，然后调用以下方法之一：
</p>
<ul>
    <li>
        <p>
            <HeadingLink title="Execute()" tag="code" />
            - 用于不返回数据的查询语句：
        </p>
        <CodeBlock
            language="go"
            content={`
                res, err := app.DB().
                    NewQuery("DELETE FROM articles WHERE status = 'archived'").
                    Execute()
            `}
        />
    </li>
    <li>
        <p>
            <HeadingLink id="execute-one" title="One()" tag="code" />
            - 将单行数据填充到结构体中：
        </p>
        <!-- prettier-ignore -->
        <CodeBlock
            language="go"
            content={`
                type User struct {
                    Id     string                  ` + "`" + `db:"id" json:"id"` + "`" + `
                    Status bool                    ` + "`" + `db:"status" json:"status"` + "`" + `
                    Age    int                     ` + "`" + `db:"age" json:"age"` + "`" + `
                    Roles  types.JSONArray[string] ` + "`" + `db:"roles" json:"roles"` + "`" + `
                }

                user := User{}

                err := app.DB().
                    NewQuery("SELECT id, status, age, roles FROM users WHERE id=1").
                    One(&user)
            `}
        />
    </li>
    <li>
        <p>
            <HeadingLink id="execute-all" title="All()" tag="code" />
            - 将多行数据填充到结构体切片中：
        </p>
        <!-- prettier-ignore -->
        <CodeBlock
            language="go"
            content={`
                type User struct {
                    Id     string                  ` + "`" + `db:"id" json:"id"` + "`" + `
                    Status bool                    ` + "`" + `db:"status" json:"status"` + "`" + `
                    Age    int                     ` + "`" + `db:"age" json:"age"` + "`" + `
                    Roles  types.JSONArray[string] ` + "`" + `db:"roles" json:"roles"` + "`" + `
                }

                users := []User{}

                err := app.DB().
                    NewQuery("SELECT id, status, age, roles FROM users LIMIT 100").
                    All(&users)
            `}
        />
    </li>
</ul>

<HeadingLink title="参数绑定" />
<p>
    为防止 SQL 注入攻击，建议对所有来自用户输入的表达式值使用命名参数。可在 SQL 语句中使用命名 <code>{`{:paramName}`}</code>
    占位符，然后通过 <code>Bind(params)</code> 为查询定义参数值。例如：
</p>
<!-- prettier-ignore -->
<CodeBlock
    language="go"
    content={`
        type Post struct {
            Name     string         ` + "`" + `db:"name" json:"name"` + "`" + `
            Created  types.DateTime ` + "`" + `db:"created" json:"created"` + "`" + `
        }

        posts := []Post{}

        err := app.DB().
            NewQuery("SELECT name, created FROM posts WHERE created >= {:from} and created <= {:to}").
            Bind(dbx.Params{
                "from": "2023-06-25 00:00:00.000Z",
                "to":   "2023-06-28 23:59:59.999Z",
            }).
            All(&posts)
    `}
/>

<HeadingLink title="查询构造器" />
<p>
    除了直接编写 SQL，还可以使用 db 查询构造器以编程方式组合 SQL 语句。
    <br />
    每个 SQL 关键字都有对应的构造方法。例如 <code>SELECT</code> 对应 <code>Select()</code>，<code>FROM</code> 对应 <code>From()</code>，
    <code>WHERE</code> 对应 <code>Where()</code>，等等。
</p>
<!-- prettier-ignore -->
<CodeBlock
    language="go"
    content={`
        users := []struct {
            Id    string ` + "`" + `db:"id" json:"id"` + "`" + `
            Email string ` + "`" + `db:"email" json:"email"` + "`" + `
        }{}

        app.DB().
            Select("id", "email").
            From("users").
            AndWhere(dbx.Like("email", "example.com")).
            Limit(100).
            OrderBy("created ASC").
            All(&users)
    `}
/>

<HeadingLink title="Select(), AndSelect(), Distinct()" tag="h5" />
<p>
    <code>Select(...cols)</code> 方法用于初始化 <code>SELECT</code> 查询构造器，参数为要查询的列名列表。
    <br />
    如需为已有查询添加更多列，可调用 <code>AndSelect()</code>。
    <br />
    如需查询去重行，可调用 <code>Distinct(true)</code>。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("id", "avatar as image").
            AndSelect("(firstName || ' ' || lastName) as fullName").
            Distinct(true)
            ...
    `}
/>

<HeadingLink title="From()" tag="h5" />
<p>
    <code>From(...tables)</code> 方法指定要查询的表名（普通表名会自动加引号）。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("table1.id", "table2.name").
            From("table1", "table2")
            ...
    `}
/>

<HeadingLink title="Join()" tag="h5" />
<p>
    <code>Join(type, table, on)</code> 方法用于指定 <code>JOIN</code> 子句。它有 3 个参数：
</p>
<ul>
    <li><code>type</code> - 连接类型字符串，如 <code>INNER JOIN</code>、<code>LEFT JOIN</code> 等</li>
    <li><code>table</code> - 要连接的表名</li>
    <li><code>on</code> - 可选的 <code>dbx.Expression</code>，作为 <code>ON</code> 条件</li>
</ul>
<p>
    为方便起见，也可使用 <code>InnerJoin(table, on)</code>、<code>LeftJoin(table, on)</code>、
    <code>RightJoin(table, on)</code> 快捷方法，分别指定 <code>INNER JOIN</code>、<code>LEFT JOIN</code> 和
    <code>RIGHT JOIN</code>。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("users.*").
            From("users").
            InnerJoin("profiles", dbx.NewExp("profiles.user_id = users.id")).
            Join("FULL OUTER JOIN", "department", dbx.NewExp("department.id = {:id}", dbx.Params{ "id": "someId" }))
            ...
    `}
/>

<HeadingLink title="Where(), AndWhere(), OrWhere()" tag="h5" />
<p>
    <code>Where(exp)</code> 方法指定查询的 <code>WHERE</code> 条件。
    <br />
    也可以使用 <code>AndWhere(exp)</code> 或 <code>OrWhere(exp)</code> 为已有 <code>WHERE</code> 子句追加一个或多个条件。
    <br />
    每个 where 条件都接受一个 <code>dbx.Expression</code>（见下方完整列表）。
</p>
<CodeBlock
    language="go"
    content={`
        /*
        SELECT users.*
        FROM users
        WHERE id = "someId" AND
            status = "public" AND
            name like "%john%" OR
            (
                role = "manager" AND
                fullTime IS TRUE AND
                experience > 10
            )
        */
        app.DB().
            Select("users.*").
            From("users").
            Where(dbx.NewExp("id = {:id}", dbx.Params{ "id": "someId" })).
            AndWhere(dbx.HashExp{"status": "public"}).
            AndWhere(dbx.Like("name", "john")).
            OrWhere(dbx.And(
                dbx.HashExp{
                    "role":     "manager",
                    "fullTime": true,
                },
                dbx.NewExp("experience > {:exp}", dbx.Params{ "exp": 10 })
            ))
            ...
    `}
/>

<p>
    可用的 <code>dbx.Expression</code> 方法如下：
</p>
<ul>
    <li>
        <HeadingLink title="dbx.NewExp(raw, optParams)" tag="code" />
        <br />
        生成带有指定原始查询片段的表达式。可通过 <code>optParams</code> 绑定 <code>dbx.Params</code>。
        <CodeBlock
            language="go"
            content={`
                dbx.NewExp("status = 'public'")
                dbx.NewExp("total > {:min} AND total < {:max}", dbx.Params{ "min": 10, "max": 30 })
            `}
        />
    </li>
    <li>
        <HeadingLink title={`dbx.HashExp{k:v}`} tag="code" />
        <br />
        从 map 生成哈希表达式，map 的键为需要过滤的数据库列名，值为对应的过滤值。
        <CodeBlock
            language="go"
            content={`
                // slug = "example" AND active IS TRUE AND tags in ("tag1", "tag2", "tag3") AND parent IS NULL
                dbx.HashExp{
                    "slug":   "example",
                    "active": true,
                    "tags":   []any{"tag1", "tag2", "tag3"},
                    "parent": nil,
                }
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.Not(exp)" tag="code" />
        <br />
        用 <code>NOT()</code> 包裹表达式，实现单个表达式取反。
        <CodeBlock
            language="go"
            content={`
                // NOT(status = 1)
                dbx.Not(dbx.NewExp("status = 1"))
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.And(...exps)" tag="code" />
        <br />
        用 <code>AND</code> 拼接多个表达式，生成新表达式。
        <CodeBlock
            language="go"
            content={`
                // (status = 1 AND username like "%john%")
                dbx.And(
                    dbx.NewExp("status = 1"),
                    dbx.Like("username", "john"),
                )
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.Or(...exps)" tag="code" />
        <br />
        用 <code>OR</code> 拼接多个表达式，生成新表达式。
        <CodeBlock
            language="go"
            content={`
                // (status = 1 OR username like "%john%")
                dbx.Or(
                    dbx.NewExp("status = 1"),
                    dbx.Like("username", "john")
                )
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.In(col, ...values)" tag="code" />
        <br />
        为指定列和允许值列表生成 <code>IN</code> 表达式。
        <CodeBlock
            language="go"
            content={`
                // status IN ("public", "reviewed")
                dbx.In("status", "public", "reviewed")
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.NotIn(col, ...values)" tag="code" />
        <br />
        为指定列和允许值列表生成 <code>NOT IN</code> 表达式。
        <CodeBlock
            language="go"
            content={`
                // status NOT IN ("public", "reviewed")
                dbx.NotIn("status", "public", "reviewed")
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.Like(col, ...values)" tag="code" />
        <br />
        为指定列和可能的字符串生成 <code>LIKE</code> 表达式。如果有多个值，列需同时匹配<strong>所有</strong>值。
        <br />
        默认每个值会被 <em>"%"</em> 包裹以实现模糊匹配。特殊字符如 <em>"%"</em>、<em>"\"</em>、<em>"_"</em> 也会被正确转义。可通过 <code>Escape(...pairs)</code> 和/或 <code>Match(left, right)</code> 修改默认行为。
        <CodeBlock
            language="go"
            content={`
                // name LIKE "%test1%" AND name LIKE "%test2%"
                dbx.Like("name", "test1", "test2")

                // name LIKE "test1%"
                dbx.Like("name", "test1").Match(false, true)
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.NotLike(col, ...values)" tag="code" />
        <br />
        类似 <code>Like()</code>，生成 <code>NOT LIKE</code> 表达式。
        <CodeBlock
            language="go"
            content={`
                // name NOT LIKE "%test1%" AND name NOT LIKE "%test2%"
                dbx.NotLike("name", "test1", "test2")

                // name NOT LIKE "test1%"
                dbx.NotLike("name", "test1").Match(false, true)
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.OrLike(col, ...values)" tag="code" />
        <br />
        类似 <code>Like()</code>，但多个值之间用 <code>OR</code> 拼接。
        <CodeBlock
            language="go"
            content={`
                // name LIKE "%test1%" OR name LIKE "%test2%"
                dbx.OrLike("name", "test1", "test2")

                // name LIKE "test1%" OR name LIKE "test2%"
                dbx.OrLike("name", "test1", "test2").Match(false, true)
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.OrNotLike(col, ...values)" tag="code" />
        <br />
        类似 <code>NotLike()</code>，但多个值之间用 <code>OR</code> 拼接。
        <CodeBlock
            language="go"
            content={`
                // name NOT LIKE "%test1%" OR name NOT LIKE "%test2%"
                dbx.OrNotLike("name", "test1", "test2")

                // name NOT LIKE "test1%" OR name NOT LIKE "test2%"
                dbx.OrNotLike("name", "test1", "test2").Match(false, true)
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.Exists(exp)" tag="code" />
        <br />
        用 <code>EXISTS</code> 前缀指定表达式（通常为子查询）。
        <CodeBlock
            language="go"
            content={`
                // EXISTS (SELECT 1 FROM users WHERE status = 'active')
                dbx.Exists(dbx.NewExp("SELECT 1 FROM users WHERE status = 'active'"))
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.NotExists(exp)" tag="code" />
        <br />
        用 <code>NOT EXISTS</code> 前缀指定表达式（通常为子查询）。
        <CodeBlock
            language="go"
            content={`
                // NOT EXISTS (SELECT 1 FROM users WHERE status = 'active')
                dbx.NotExists(dbx.NewExp("SELECT 1 FROM users WHERE status = 'active'"))
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.Between(col, from, to)" tag="code" />
        <br />
        生成指定范围的 <code>BETWEEN</code> 表达式。
        <CodeBlock
            language="go"
            content={`
                // age BETWEEN 3 and 99
                dbx.Between("age", 3, 99)
            `}
        />
    </li>
    <li>
        <HeadingLink title="dbx.NotBetween(col, from, to)" tag="code" />
        <br />
        生成指定范围的 <code>NOT BETWEEN</code> 表达式。
        <CodeBlock
            language="go"
            content={`
                // age NOT BETWEEN 3 and 99
                dbx.NotBetween("age", 3, 99)
            `}
        />
    </li>
</ul>

<HeadingLink title="OrderBy(), AndOrderBy()" tag="h5" />
<p>
    <code>OrderBy(...cols)</code> 指定查询的 <code>ORDER BY</code> 子句。
    <br />
    列名可包含 <em>"ASC"</em> 或 <em>"DESC"</em> 以指定排序方向。
    <br />
    也可使用 <code>AndOrderBy(...cols)</code> 为已有 <code>ORDER BY</code> 子句追加更多列。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("users.*").
            From("users").
            OrderBy("created ASC", "updated DESC").
            AndOrderBy("title ASC")
            ...
    `}
/>

<HeadingLink title="GroupBy(), AndGroupBy()" tag="h5" />
<p>
    <code>GroupBy(...cols)</code> 指定查询的 <code>GROUP BY</code> 子句。
    <br />
    也可使用 <code>AndGroupBy(...cols)</code> 为已有 <code>GROUP BY</code> 子句追加更多列。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("users.*").
            From("users").
            GroupBy("department", "level")
            ...
    `}
/>

<HeadingLink title="Having(), AndHaving(), OrHaving()" tag="h5" />
<p>
    <code>Having(exp)</code> 指定查询的 <code>HAVING</code> 子句。
    <br />
    与 <code>Where(exp)</code> 类似，接受一个 <code>dbx.Expression</code>（见上方所有可用表达式）。
    <br />
    也可使用 <code>AndHaving(exp)</code> 或 <code>OrHaving(exp)</code> 为已有 <code>HAVING</code> 子句追加一个或多个条件。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("users.*").
            From("users").
            GroupBy("department", "level").
            Having(dbx.NewExp("sum(level) > {:sum}", dbx.Params{ sum: 10 }))
            ...
    `}
/>

<HeadingLink title="Limit()" tag="h5" />
<p>
    <code>Limit(number)</code> 方法指定查询的 <code>LIMIT</code> 子句。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("users.*").
            From("users").
            Limit(30)
            ...
    `}
/>

<HeadingLink title="Offset()" tag="h5" />
<p>
    <code>Offset(number)</code> 方法指定查询的 <code>OFFSET</code> 子句，通常与 <code>Limit(number)</code> 一起使用。
</p>
<CodeBlock
    language="go"
    content={`
        app.DB().
            Select("users.*").
            From("users").
            Offset(5).
            Limit(30)
            ...
    `}
/>

<HeadingLink title="事务" />
<TransactionInfoGo />
<CodeBlock
    language="go"
    content={`
        err := app.RunInTransaction(func(txApp core.App) error {
            // update a record
            record, err := txApp.FindRecordById("articles", "RECORD_ID")
            if err != nil {
                return err
            }
            record.Set("status", "active")
            if err := txApp.Save(record); err != nil {
                return err
            }

            // run a custom raw query (doesn't fire event hooks)
            rawQuery := "DELETE FROM articles WHERE status = 'pending'"
            if _, err := txApp.DB().NewQuery(rawQuery).Execute(); err != nil {
                return err
            }

            return nil
        })
    `}
/>
```
</copilot-edited-file>
