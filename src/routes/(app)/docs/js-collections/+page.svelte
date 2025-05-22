<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
    import fieldNames from "../field_names.js";
</script>

<p>
    Collections 通常通过 Dashboard 界面进行管理，但在某些情况下，你可能希望以编程方式创建或编辑 Collection（通常作为
    <a href="/docs/js-migrations">数据库迁移</a> 的一部分）。你可以在
    <a href="/jsvm/modules/_app.html" target="_blank" rel="noopener noreferrer">
        <code>$app</code>
    </a>
    和
    <a href="/jsvm/classes/Collection.html" target="_blank" rel="noopener noreferrer">
        <code>Collection</code>
    </a>
    中找到所有可用的 Collection 相关操作和方法，下面列出了一些最常用的方法：
</p>

<Toc />

<HeadingLink title="获取 Collection" />

<HeadingLink title="获取单个 Collection" tag="h5" />
<p class="txt-hint">所有单个 Collection 检索方法在未找到 Collection 时会抛出错误。</p>
<CodeBlock
    language="javascript"
    content={`
        let collection = $app.findCollectionByNameOrId("example")
    `}
/>

<HeadingLink title="获取多个 Collection" tag="h5" />
<p class="txt-hint">
    所有多个 Collection 检索方法在未找到 Collection 时会返回空数组。
</p>
<CodeBlock
    language="javascript"
    content={`
        let allCollections = $app.findAllCollections(/* optional types */)

        // only specific types
        let authAndViewCollections := $app.findAllCollections("auth", "view")
    `}
/>

<HeadingLink title="自定义 Collection 查询" tag="h5" />
<p>
    除了上述查询助手外，你还可以使用
    <a href="/jsvm/functions/_app.collectionQuery.html" target="_blank" rel="noopener noreferrer">
        <code>$app.collectionQuery()</code>
    </a>
    方法创建自定义 Collection 查询。它返回一个 SELECT 数据库构建器，可与
    <a href="/docs/js-database">数据库指南</a> 中描述的方法一起使用。
</p>
<CodeBlock
    language="javascript"
    content={`
        let collections = arrayOf(new Collection)

        $app.collectionQuery().
            andWhere($dbx.hashExp({"viewRule": null})).
            orderBy("created DESC").
            all(collections)
    `}
/>

<HeadingLink title="字段定义" />
<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            所有 Collection 字段 <em>（除了 <code>JSONField</code>）</em> 都为非空类型，并在缺失时使用其类型的零值作为默认值。
        </p>
    </div>
</div>
<ul>
    {#each fieldNames as field}
        <li>
            <a href="/jsvm/classes/{field}.html" target="_blank" rel="noopener noreferrer">
                <code>new {field}({`{ ... }`})</code>
            </a>
        </li>
    {/each}
</ul>

<HeadingLink title="创建新 Collection" />
<CodeBlock
    language="javascript"
    content={`
        // missing default options, system fields like id, email, etc. are initialized automatically
        // and will be merged with the provided configuration
        let collection = new Collection({
            type:       "base", // base | auth | view
            name:       "example",
            listRule:   null,
            viewRule:   "@request.auth.id != ''",
            createRule: "",
            updateRule: "@request.auth.id != ''",
            deleteRule: null,
            fields: [
                {
                    name:     "title",
                    type:     "text",
                    required: true,
                    max: 10,
                },
                {
                    name:          "user",
                    type:          "relation",
                    required:      true,
                    maxSelect:     1,
                    collectionId:  "ae40239d2bc4477",
                    cascadeDelete: true,
                },
            ],
            indexes: [
                "CREATE UNIQUE INDEX idx_user ON example (user)"
            ],
        })

        // validate and persist
        // (use saveNoValidate to skip fields validation)
        $app.save(collection)
    `}
/>

<HeadingLink title="更新已有 Collection" />
<CodeBlock
    language="javascript"
    content={`
        let collection = $app.findCollectionByNameOrId("example")

        // change the collection name
        collection.name = "example_update"

        // add new editor field
        collection.fields.add(new EditorField({
            name:     "description",
            required: true,
        }))

        // change existing field
        // (returns a pointer and direct modifications are allowed without the need of reinsert)
        let titleField = collection.fields.getByName("title")
        titleField.min = 10

        // or: collection.indexes.push("CREATE INDEX idx_example_title ON example (title)")
        collection.addIndex("idx_example_title", false, "title", "")

        // validate and persist
        // (use saveNoValidate to skip fields validation)
        $app.save(collection)
    `}
/>

<HeadingLink title="删除 Collection" />
<CodeBlock
    language="javascript"
    content={`
        let collection = $app.findCollectionByNameOrId("example")

        $app.delete(collection)
    `}
/>
