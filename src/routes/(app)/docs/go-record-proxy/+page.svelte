<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
</script>

<p>
    推荐使用 <a href="/docs/go-records"><code>core.Record</code> 及其辅助方法</a> 与数据进行交互，但如果你希望以类型化方式访问记录字段，可以创建一个嵌入了
    <a href="{import.meta.env.PB_GODOC_URL}/core#BaseRecordProxy" target="_blank" rel="noopener noreferrer">
        <code>core.BaseRecordProxy</code>
    </a>
    的辅助结构体
    <em>（它实现了 <code>core.RecordProxy</code> 接口）</em>，并将你的集合字段定义为 getter 和 setter 方法。
</p>

<p>
    通过实现 <code>core.RecordProxy</code> 接口，你可以像常规记录模型一样在 <code>RecordQuery</code> 结果中使用自定义结构体。此外，通过代理结构体进行的每一次数据库变更都会触发相应的记录校验和钩子。这确保了应用的其他部分（包括不了解或未使用你自定义结构体的第三方插件）依然能正常工作。
</p>

<p>下面是一个 <code>Article</code> 记录代理的示例实现：</p>
<CodeBlock
    language="go"
    content={`
        // article.go
        package main

        import (
            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tools/types"
        )

        // ensures that the Article struct satisfy the core.RecordProxy interface
        var _ core.RecordProxy = (*Article)(nil)

        type Article struct {
            core.BaseRecordProxy
        }

        func (a *Article) Title() string {
            return a.GetString("title")
        }

        func (a *Article) SetTitle(title string) {
            a.Set("title", title)
        }

        func (a *Article) Slug() string {
            return a.GetString("slug")
        }

        func (a *Article) SetSlug(slug string) {
            a.Set("slug", slug)
        }

        func (a *Article) Created() types.DateTime {
            return a.GetDateTime("created")
        }

        func (a *Article) Updated() types.DateTime {
            return a.GetDateTime("updated")
        }
    `}
/>

<p>
    访问和修改代理记录的方式与普通记录相同。继续以上 <code>Article</code> 示例：
</p>
<CodeBlock
    language="go"
    content={`
        func FindArticleBySlug(app core.App, slug string) (*Article, error) {
            article := &Article{}

            err := app.RecordQuery("articles").
                AndWhere(dbx.NewExp("LOWER(slug)={:slug}", dbx.Params{
                    "slug": strings.ToLower(slug), // case insensitive match
                })).
                Limit(1).
                One(article)

            if err != nil {
                return nil, err
            }

            return article, nil
        }

        ...

        article, err := FindArticleBySlug(app, "example")
        if err != nil {
            return err
        }

        // change the title
        article.SetTitle("Lorem ipsum...")

        // persist the change while also triggering the original record validations and hooks
        err = app.Save(article)
        if err != nil {
            return err
        }
    `}
/>

<p>
    如果你已有一个 <code>*core.Record</code> 值，也可以通过 <code>SetProxyRecord</code> 方法加载到你的代理结构体中：
</p>

<CodeBlock
    language="go"
    content={`
        // fetch regular record
        record, err := app.FindRecordById("articles", "RECORD_ID")
        if err != nil {
            return err
        }

        // load into proxy
        article := &Article{}
        article.SetProxyRecord(record)
    `}
/>