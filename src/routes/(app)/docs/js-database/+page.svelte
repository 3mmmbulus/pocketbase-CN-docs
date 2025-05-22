<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import TransactionInfoJS from "../TransactionInfoJS.svelte";
</script>

<p>
    <a href="/jsvm/modules/_app.html" target="_blank">
        <code>$app</code>
    </a>
    是与数据库交互的主要接口。
</p>
<p>
    <code>$app.db()</code>
    返回一个 <code>dbx.Builder</code>，可以运行各种 SQL 语句，包括原始查询。
</p>
<div class="alert alert-info">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            如需了解更多如何以编程方式与 Record 和 Collection 模型交互的详细信息和示例，
            你也可以查看 <a href="/docs/js-collections">集合操作</a>
            和
            <a href="/docs/js-records">记录操作</a> 部分。
        </p>
    </div>
</div>

<Toc />

<HeadingLink title="执行查询" />
<p>
    要执行数据库查询，可以从 <code>newQuery("...")</code> 语句开始，然后调用以下方法之一：
</p>
<ul>
    <li>
        <p>
            <HeadingLink title="execute()" tag="code" />
            - 用于不需要返回数据的查询语句：
        </p>
        <CodeBlock
            language="javascript"
            content={`
                $app.db()
                    .newQuery("DELETE FROM articles WHERE status = 'archived'")
                    .execute() // throw an error on db failure
            `}
        />
    </li>
    <li>
        <p>
            <HeadingLink id="execute-one" title="one()" tag="code" />
            - 将单行数据填充到 <code>DynamicModel</code> 对象中：
        </p>
        <CodeBlock
            language="javascript"
            content={`
                const result = new DynamicModel({
                    // describe the shape of the data (used also as initial values)
                    // the keys cannot start with underscore and must be a valid Go struct field name
                    "id":     "",
                    "status": false,
                    "age":    0, // use -0 for a float value
                    "roles":  [], // serialized json db arrays are decoded as plain arrays
                })

                $app.db()
                    .newQuery("SELECT id, status, age, roles FROM users WHERE id=1")
                    .one(result) // throw an error on db failure or missing row

                console.log(result.id)
            `}
        />
    </li>
    <li>
        <p>
            <HeadingLink id="execute-all" title="all()" tag="code" />
            - 将多行数据填充到对象数组中（注意数组必须用 <code>arrayOf</code> 创建）：
        </p>
        <CodeBlock
            language="javascript"
            content={`
                const result = arrayOf(new DynamicModel({
                    // describe the shape of the data (used also as initial values)
                    // the keys cannot start with underscore and must be a valid Go struct field name
                    "id":     "",
                    "status": false,
                    "age":    0, // use -0 for a float value
                    "roles":  [], // serialized json db arrays are decoded as plain arrays
                }))

                $app.db()
                    .newQuery("SELECT id, status, age, roles FROM users LIMIT 100")
                    .all(result) // throw an error on db failure

                if (result.length > 0) {
                    console.log(result[0].id)
                }
            `}
        />
    </li>
</ul>

<HeadingLink title="绑定参数" />
<p>
    为防止 SQL 注入攻击，建议对所有来自用户输入的表达式值使用命名参数。可以在 SQL 语句中使用命名 <code>{`{:paramName}`}</code>
    占位符，然后通过 <code>bind(params)</code> 方法为查询定义参数值。例如：
</p>
<CodeBlock
    language="javascript"
    content={`
        const result = arrayOf(new DynamicModel({
            "name":    "",
            "created": "",
        }))

        $app.db()
            .newQuery("SELECT name, created FROM posts WHERE created >= {:from} and created <= {:to}")
            .bind({
                "from": "2023-06-25 00:00:00.000Z",
                "to":   "2023-06-28 23:59:59.999Z",
            })
            .all(result)

        console.log(result.length)
    `}
/>

<HeadingLink title="查询构建器" />
<p>
    除了编写原始 SQL，还可以使用数据库查询构建器以编程方式组合 SQL 语句。
    <br />
    每个 SQL 关键字都有对应的查询构建方法。例如，<code>SELECT</code> 对应 <code>select()</code>，<code>FROM</code> 对应 <code>from()</code>，
    <code>WHERE</code> 对应 <code>where()</code>，等等。
</p>
<CodeBlock
    language="javascript"
    content={`
        const result = arrayOf(new DynamicModel({
            "id":    "",
            "email": "",
        }))

        $app.db()
            .select("id", "email")
            .from("users")
            .andWhere($dbx.like("email", "example.com"))
            .limit(100)
            .orderBy("created ASC")
            .all(result)
    `}
/>

<HeadingLink title="select(), andSelect(), distinct()" tag="h5" />
<p>
    <code>select(...cols)</code> 方法用于初始化 <code>SELECT</code> 查询构建器。它接受要选择的列名列表。
    <br />
    要向已有的 select 查询添加额外的列，可以调用 <code>andSelect()</code>。
    <br />
    如需选择唯一行，可以调用 <code>distinct(true)</code>。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("id", "avatar as image")
            .andSelect("(firstName || ' ' || lastName) as fullName")
            .distinct(true)
            ...
    `}
/>

<HeadingLink title="from()" tag="h5" />
<p>
    <code>from(...tables)</code> 方法指定要从哪些表中查询（普通表名会自动加引号）。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("table1.id", "table2.name")
            .from("table1", "table2")
            ...
    `}
/>

<HeadingLink title="join()" tag="h5" />
<p>
    <code>join(type, table, on)</code> 方法用于指定 <code>JOIN</code> 子句。它有 3 个参数：
</p>
<ul>
    <li><code>type</code> - 连接类型字符串，如 <code>INNER JOIN</code>、<code>LEFT JOIN</code> 等。</li>
    <li><code>table</code> - 要连接的表名</li>
    <li><code>on</code> - 可选的 <code>dbx.Expression</code>，作为 <code>ON</code> 条件</li>
</ul>
<p>
    为方便起见，也可以使用 <code>innerJoin(table, on)</code>、
    <code>leftJoin(table, on)</code>、
    <code>rightJoin(table, on)</code> 这些快捷方法，分别指定 <code>INNER JOIN</code>、<code>LEFT JOIN</code> 和
    <code>RIGHT JOIN</code>。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("users.*")
            .from("users")
            .innerJoin("profiles", $dbx.exp("profiles.user_id = users.id"))
            .join("FULL OUTER JOIN", "department", $dbx.exp("department.id = {:id}", {id: "someId"}))
            ...
    `}
/>

<HeadingLink title="where(), andWhere(), orWhere()" tag="h5" />
<p>
    <code>where(exp)</code> 方法用于指定查询的 <code>WHERE</code> 条件。
    <br />
    也可以使用 <code>andWhere(exp)</code> 或 <code>orWhere(exp)</code> 向已有的 <code>WHERE</code> 子句追加一个或多个条件。
    <br />
    每个 where 条件都接受一个 <code>dbx.Expression</code>（详见下方完整列表）。
</p>
<CodeBlock
    language="javascript"
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
        $app.db()
            .select("users.*")
            .from("users")
            .where($dbx.exp("id = {:id}", { id: "someId" }))
            .andWhere($dbx.hashExp({ status: "public" }))
            .andWhere($dbx.like("name", "john"))
            .orWhere($dbx.and(
                $dbx.hashExp({
                    role:     "manager",
                    fullTime: true,
                }),
                $dbx.exp("experience > {:exp}", { exp: 10 })
            ))
            ...
    `}
/>

<p>
    可用的 <code>dbx.Expression</code> 方法如下：
</p>
<ul>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.exp(raw, optParams)" tag="code" />
        <br />
        生成包含指定原始查询片段的表达式。使用 <code>optParams</code> 绑定参数到表达式。
        <CodeBlock
            language="javascript"
            content={`
                $dbx.exp("status = 'public'")
                $dbx.exp("total > {:min} AND total < {:max}", { min: 10, max: 30 })
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.hashExp(pairs)" tag="code" />
        <br />
        根据键值对生成哈希表达式，键为需要过滤的数据库列名，值为对应的过滤值。
        <CodeBlock
            language="javascript"
            content={`
                // slug = "example" AND active IS TRUE AND tags in ("tag1", "tag2", "tag3") AND parent IS NULL
                $dbx.hashExp({
                    slug:   "example",
                    active: true,
                    tags:   ["tag1", "tag2", "tag3"],
                    parent: null,
                })
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.not(exp)" tag="code" />
        <br />
        用 <code>NOT()</code> 包裹表达式，实现取反。
        <CodeBlock
            language="javascript"
            content={`
                // NOT(status = 1)
                $dbx.not($dbx.exp("status = 1"))
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.and(...exps)" tag="code" />
        <br />
        用 <code>AND</code> 连接多个表达式，生成新表达式。
        <CodeBlock
            language="javascript"
            content={`
                // (status = 1 AND username like "%john%")
                $dbx.and($dbx.exp("status = 1"), $dbx.like("username", "john"))
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.or(...exps)" tag="code" />
        <br />
        用 <code>OR</code> 连接多个表达式，生成新表达式。
        <CodeBlock
            language="javascript"
            content={`
                // (status = 1 OR username like "%john%")
                $dbx.or($dbx.exp("status = 1"), $dbx.like("username", "john"))
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.in(col, ...values)" tag="code" />
        <br />
        为指定列和允许值列表生成 <code>IN</code> 表达式。
        <CodeBlock
            language="javascript"
            content={`
                // status IN ("public", "reviewed")
                $dbx.in("status", "public", "reviewed")
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.notIn(col, ...values)" tag="code" />
        <br />
        为指定列和允许值列表生成 <code>NOT IN</code> 表达式。
        <CodeBlock
            language="javascript"
            content={`
                // status NOT IN ("public", "reviewed")
                $dbx.notIn("status", "public", "reviewed")
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.like(col, ...values)" tag="code" />
        <br />
        为指定列和可能的字符串生成 <code>LIKE</code> 表达式。如果有多个值，列需同时匹配所有值。
        <br />
        默认每个值会被 <em>"%"</em> 包裹以实现模糊匹配。特殊字符如 <em>"%"</em>、<em>"\"</em>、<em>"_"</em> 也会被正确转义。可调用
        <code>escape(...pairs)</code> 和/或 <code>match(left, right)</code> 改变默认行为。
        <CodeBlock
            language="javascript"
            content={`
                // name LIKE "%test1%" AND name LIKE "%test2%"
                $dbx.like("name", "test1", "test2")

                // name LIKE "test1%"
                $dbx.like("name", "test1").match(false, true)
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.notLike(col, ...values)" tag="code" />
        <br />
        以类似 <code>like()</code> 的方式生成 <code>NOT LIKE</code> 表达式。
        <CodeBlock
            language="javascript"
            content={`
                // name NOT LIKE "%test1%" AND name NOT LIKE "%test2%"
                $dbx.notLike("name", "test1", "test2")

                // name NOT LIKE "test1%"
                $dbx.notLike("name", "test1").match(false, true)
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.orLike(col, ...values)" tag="code" />
        <br />
        与 <code>like()</code> 类似，但多个值之间用 <code>OR</code> 连接。
        <CodeBlock
            language="javascript"
            content={`
                // name LIKE "%test1%" OR name LIKE "%test2%"
                $dbx.orLike("name", "test1", "test2")

                // name LIKE "test1%" OR name LIKE "test2%"
                $dbx.orLike("name", "test1", "test2").match(false, true)
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.orNotLike(col, ...values)" tag="code" />
        <br />
        与 <code>notLike()</code> 类似，但多个值之间用 <code>OR</code> 连接。
        <CodeBlock
            language="javascript"
            content={`
                // name NOT LIKE "%test1%" OR name NOT LIKE "%test2%"
                $dbx.orNotLike("name", "test1", "test2")

                // name NOT LIKE "test1%" OR name NOT LIKE "test2%"
                $dbx.orNotLike("name", "test1", "test2").match(false, true)
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.exists(exp)" tag="code" />
        <br />
        用 <code>EXISTS</code> 前缀指定表达式（通常为子查询）。
        <CodeBlock
            language="javascript"
            content={`
                // EXISTS (SELECT 1 FROM users WHERE status = 'active')
                $dbx.exists(dbx.exp("SELECT 1 FROM users WHERE status = 'active'"))
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.notExists(exp)" tag="code" />
        <br />
        用 <code>NOT EXISTS</code> 前缀指定表达式（通常为子查询）。
        <CodeBlock
            language="javascript"
            content={`
                // NOT EXISTS (SELECT 1 FROM users WHERE status = 'active')
                $dbx.notExists(dbx.exp("SELECT 1 FROM users WHERE status = 'active'"))
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.between(col, from, to)" tag="code" />
        <br />
        用指定范围生成 <code>BETWEEN</code> 表达式。
        <CodeBlock
            language="javascript"
            content={`
                // age BETWEEN 3 and 99
                $dbx.between("age", 3, 99)
            `}
        />
    </li>
    <li class="m-b-xs">
        <HeadingLink title="$dbx.notBetween(col, from, to)" tag="code" />
        <br />
        用指定范围生成 <code>NOT BETWEEN</code> 表达式。
        <CodeBlock
            language="javascript"
            content={`
                // age NOT BETWEEN 3 and 99
                $dbx.notBetween("age", 3, 99)
            `}
        />
    </li>
</ul>

<HeadingLink title="orderBy(), andOrderBy()" tag="h5" />
<p>
    <code>orderBy(...cols)</code> 用于指定查询的 <code>ORDER BY</code> 子句。
    <br />
    列名中可以包含 <em>"ASC"</em> 或 <em>"DESC"</em>，以指示排序方向。
    <br />
    也可以使用 <code>andOrderBy(...cols)</code> 向已有的 <code>ORDER BY</code> 子句追加更多列。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("users.*")
            .from("users")
            .orderBy("created ASC", "updated DESC")
            .andOrderBy("title ASC")
            ...
    `}
/>

<HeadingLink title="groupBy(), andGroupBy()" tag="h5" />
<p>
    <code>groupBy(...cols)</code> 用于指定查询的 <code>GROUP BY</code> 子句。
    <br />
    也可以使用 <code>andGroupBy(...cols)</code> 向已有的 <code>GROUP BY</code> 子句追加更多列。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("users.*")
            .from("users")
            .groupBy("department", "level")
            ...
    `}
/>

<HeadingLink title="having(), andHaving(), orHaving()" tag="h5" />
<p>
    <code>having(exp)</code> 用于指定查询的 <code>HAVING</code> 子句。
    <br />
    与 <code>where(exp)</code> 类似，接受一个 <code>dbx.Expression</code>（可用表达式见上方列表）。
    <br />
    也可以使用 <code>andHaving(exp)</code> 或 <code>orHaving(exp)</code> 向已有的 <code>HAVING</code> 子句追加一个或多个条件。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("users.*")
            .from("users")
            .groupBy("department", "level")
            .having($dbx.exp("sum(level) > {:sum}", { sum: 10 }))
            ...
    `}
/>

<HeadingLink title="limit()" tag="h5" />
<p>
    <code>limit(number)</code> 方法用于指定查询的 <code>LIMIT</code> 子句。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("users.*")
            .from("users")
            .limit(30)
            ...
    `}
/>

<HeadingLink title="offset()" tag="h5" />
<p>
    <code>offset(number)</code> 方法用于指定查询的 <code>OFFSET</code> 子句。通常与 <code>limit(number)</code> 一起使用。
</p>
<CodeBlock
    language="javascript"
    content={`
        $app.db()
            .select("users.*")
            .from("users")
            .offset(5)
            .limit(30)
            ...
    `}
/>

<HeadingLink title="事务" />
<TransactionInfoJS />
<CodeBlock
    language="javascript"
    content={`
        $app.runInTransaction((txApp) => {
            // update a record
            const record = txApp.findRecordById("articles", "RECORD_ID")
            record.set("status", "active")
            txApp.save(record)

            // run a custom raw query (doesn't fire event hooks)
            txApp.db().newQuery("DELETE FROM articles WHERE status = 'pending'").execute()
        })
    `}
/>
