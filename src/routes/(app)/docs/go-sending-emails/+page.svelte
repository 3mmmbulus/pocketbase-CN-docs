<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<p>
    PocketBase 提供了一个简单的抽象，通过 <code>app.NewMailClient()</code> 工厂方法发送邮件。
</p>

<p>
    根据你配置的邮件设置（<em>仪表盘 > 设置 > 邮件设置</em>），它会使用 <code>sendmail</code> 命令或 SMTP 客户端。
</p>

<Toc />

<HeadingLink title="发送自定义邮件" />
<p>
    你可以在应用的任何地方（hooks、middlewares、routes 等）通过 <code>app.NewMailClient().Send(message)</code> 发送自定义邮件。下面是一个在用户注册后发送自定义邮件的示例：
</p>
<CodeBlock
    language="go"
    content={`
        // main.go
        package main

        import (
            "log"
            "net/mail"

            "github.com/pocketbase/pocketbase"
            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tools/mailer"
        )

        func main() {
            app := pocketbase.New()

            app.OnRecordCreateRequest("users").BindFunc(func(e *core.RecordRequestEvent) error {
                if err := e.Next(); err != nil {
                    return err
                }

                message := &mailer.Message{
                    From: mail.Address{
                        Address: e.App.Settings().Meta.SenderAddress,
                        Name:    e.App.Settings().Meta.SenderName,
                    },
                    To:      []mail.Address{{Address: e.Record.Email()}},
                    Subject: "YOUR_SUBJECT...",
                    HTML:    "YOUR_HTML_BODY...",
                    // bcc, cc, attachments and custom headers are also supported...
                }

                return e.App.NewMailClient().Send(message)
            })

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>

<HeadingLink title="覆盖系统邮件" />
<p>
    如果你想覆盖默认的系统邮件（如忘记密码、验证等），可以在
    <em>仪表盘 > 集合 > 编辑集合 > 选项</em>
    中调整默认模板。
</p>
<p>
    或者，你也可以通过绑定到某个
    <a href="/docs/go-event-hooks/#mailer-hooks">mailer hook</a>，实现个性化修改。下面是一个使用 <code>OnMailerRecordPasswordResetSend</code> hook，将 Record 字段值追加到主题的示例：
</p>
<CodeBlock
    language="go"
    content={`
        // main.go
        package main

        import (
            "log"

            "github.com/pocketbase/pocketbase"
            "github.com/pocketbase/pocketbase/core"
        )

        func main() {
            app := pocketbase.New()

            app.OnMailerRecordPasswordResetSend("users").BindFunc(func(e *core.MailerRecordEvent) error {
                // modify the subject
                e.Message.Subject += (" " + e.Record.GetString("name"))

                return e.Next()
            })

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>