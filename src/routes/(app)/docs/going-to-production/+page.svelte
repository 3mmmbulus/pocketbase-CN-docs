<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CommonHelper from "@/utils/CommonHelper";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<Toc />

<HeadingLink title="部署策略" />

<HeadingLink title="最小化部署" tag="h5" />
<p>
    PocketBase 最棒的特性之一就是它完全可移植。这意味着它不需要任何外部依赖，
    <strong>只需将可执行文件上传到你的服务器即可部署</strong>。
</p>
<p>
    下面是一个在全新 Ubuntu 22.04 系统上启动生产环境 HTTPS 服务器（自动管理 TLS 和 Let's Encrypt）的示例。
</p>
<ol>
    <li value="0">
        <p>假设你的应用目录结构如下：</p>
        <CodeBlock
            language="html"
            content={`
                myapp/
                    pb_migrations/
                    pb_hooks/
                    pocketbase
            `}
        />
    </li>
    <li>
        <p>
            上传二进制文件及应用所需的其他内容到你的远程服务器，例如使用
            <strong>rsync</strong>：
        </p>
        <CodeBlock
            content={`
                rsync -avz -e ssh /local/path/to/myapp root@YOUR_SERVER_IP:/root/pb
            `}
        />
    </li>
    <li>
        <p>通过 SSH 连接到你的服务器：</p>
        <CodeBlock
            content={`
                ssh root@YOUR_SERVER_IP
            `}
        />
    </li>
    <li>
        <p>启动可执行文件（指定域名会为其申请 Let's Encrypt 证书）</p>
        <CodeBlock
            content={`
              [root@dev ~]$ /root/pb/pocketbase serve yourdomain.com
            `}
        />
        <blockquote>
            <p>
                注意，上述示例中我们以 <strong>root</strong> 用户登录，这样可以绑定
                <strong>特权端口 80 和 443</strong>。
                <br />
                对于 <strong>非 root</strong> 用户，通常需要特殊权限才能绑定这些端口。根据你的操作系统有多种方式可选，如 <code>authbind</code>、
                <code>setcap</code>、
                <code>iptables</code>、<code>sysctl</code> 等。以下是使用 <code>setcap</code> 的示例：
            </p>
            <CodeBlock
                content={`
                    [myuser@dev ~]$ sudo setcap 'cap_net_bind_service=+ep' /root/pb/pocketbase
                `}
            />
        </blockquote>
    </li>
    <li>
        <p>（可选）Systemd 服务</p>
        <p>
            你可以跳过第 3 步，直接创建一个 <strong>Systemd 服务</strong>
            让你的应用可以自动启动/重启。
            <br />
            下面是一个服务文件示例（通常创建在
            <code>/lib/systemd/system/pocketbase.service</code>）：
        </p>
        <CodeBlock
            content={`
                [Unit]
                Description = pocketbase

                [Service]
                Type             = simple
                User             = root
                Group            = root
                LimitNOFILE      = 4096
                Restart          = always
                RestartSec       = 5s
                StandardOutput   = append:/root/pb/std.log
                StandardError    = append:/root/pb/std.log
                WorkingDirectory = /root/pb
                ExecStart        = /root/pb/pocketbase serve yourdomain.com

                [Install]
                WantedBy = multi-user.target
            `}
        />
        <p>
            然后只需通过 <code>systemctl</code> 启用并启动服务：
        </p>
        <CodeBlock
            content={`
                [root@dev ~]$ systemctl enable pocketbase.service
                [root@dev ~]$ systemctl start pocketbase
            `}
        />
        <blockquote>
            <p>
                你可以在 <code>/root/pb/std.log</code> 中找到 Web UI 安装器的链接，
                也可以通过 PocketBase 的 <code>superuser</code> 命令手动创建第一个超级用户：
            </p>
            <CodeBlock
                content={`
                    [root@dev ~]$ /root/pb/pocketbase superuser create EMAIL PASS
                `}
            />
        </blockquote>
    </li>
</ol>

<HeadingLink title="使用反向代理" tag="h5" />
<p>
    如果你计划在同一台服务器上托管多个应用，或需要更精细的网络控制，可以将 PocketBase 放在
    <em>NGINX</em>、<em>Apache</em>、<em>Caddy</em> 等反向代理之后。
    <br />
    <em>
        注意：使用反向代理时，可能需要在 PocketBase 设置中配置“用户 IP 代理头”，
        以便应用能获取并记录真实访问者/客户端 IP（通常为 <code>X-Real-IP</code>、<code>X-Forwarded-For</code>）。
    </em>
</p>
<p>
    下面是一个最小化 <em>NGINX</em> 配置示例：
</p>
<CodeBlock
    language="html"
    content={`
    server {
        listen 80;
        server_name example.com;
        client_max_body_size 10M;

        location / {
            # check http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive
            proxy_set_header Connection '';
            proxy_http_version 1.1;
            proxy_read_timeout 360s;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # enable if you are serving under a subpath location
            # rewrite /yourSubpath/(.*) /$1  break;

            proxy_pass http://127.0.0.1:8090;
        }
    }
    `}
/>
<p>
    对应的 <em>Caddy</em> 配置如下：
</p>
<CodeBlock
    language="html"
    content={`
    example.com {
        request_body {
            max_size 10MB
        }
        reverse_proxy 127.0.0.1:8090 {
            transport http {
                read_timeout 360s
            }
        }
    }
    `}
/>
<HeadingLink title="使用 Docker" tag="h5" />
<p>
    部分主机（如 <a href="https://fly.io" target="_blank" rel="noopener noreferrer">fly.io</a>）使用 Docker 部署。
    PocketBase 没有官方 Docker 镜像，但你可以参考下面的最小化 Dockerfile 示例：
</p>
<CodeBlock
    language="html"
    content={`
        FROM alpine:latest

        ARG PB_VERSION=` +
        (import.meta.env.PB_VERSION.startsWith("v")
            ? import.meta.env.PB_VERSION.substring(1)
            : import.meta.env.PB_VERSION) +
        `

        RUN apk add --no-cache \\
            unzip \\
            ca-certificates

        # download and unzip PocketBase
        ADD https://github.com/pocketbase/pocketbase/releases/download/v\${PB_VERSION}/pocketbase_\${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
        RUN unzip /tmp/pb.zip -d /pb/

        # uncomment to copy the local pb_migrations dir into the image
        # COPY ./pb_migrations /pb/pb_migrations

        # uncomment to copy the local pb_hooks dir into the image
        # COPY ./pb_hooks /pb/pb_hooks

        EXPOSE 8080

        # start PocketBase
        CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
    `}
/>
<p class="txt-bold">
    若要持久化你的数据，需要将卷挂载到 <code>/pb/pb_data</code>。
</p>
<p class="txt-hint">
    <em>
        完整示例可参考
        <a
            href="https://github.com/pocketbase/pocketbase/discussions/537"
            target="_blank"
            rel="noopener noreferrer"
        >
            “在 Fly.io 免费托管”
        </a>
        指南。
    </em>
</p>

<HeadingLink title="备份与恢复" />
<p>
    备份/恢复你的应用只需手动复制/替换 <code>pb_data</code> 目录
    <em>（为保证事务安全，请确保应用未运行）</em>。
</p>
<p>
    为了更方便，PocketBase v0.16+ 内置了备份与恢复 API，可在仪表盘中访问
    <em>Settings</em>
    {`>`} <em>Backups</em>
    ：
</p>
<img src="/images/screenshots/backups.png" alt="Backups settings screenshot" class="screenshot m-b-xs" />
<p>
    备份可本地存储（默认）或存储到兼容 S3 的存储中（<em
        >建议为备份单独使用一个 bucket</em
    >）。生成的备份是 <code>pb_data</code> 目录的完整快照 ZIP 压缩包（包含本地上传文件，但不包含本地备份或上传到 S3 的文件）。
</p>
<div class="alert alert-warning m-b-xs">
    <div class="icon">
        <i class="ri-error-warning-line" />
    </div>
    <div class="content">
        <p class="txt-bold">
            生成备份 ZIP 时，应用会临时进入只读模式。
        </p>
        <p>
            根据 <code>pb_data</code> 的大小，这可能是一个非常耗时的操作。对于较大的 <code>pb_data</code>（如 2GB+），建议采用其他备份策略
            <em class="txt-sm">
                （可参考
                <a
                    href="https://github.com/pocketbase/pocketbase/discussions/4254#backups"
                    target="_blank"
                    rel="noopener noreferrer">backup.sh 脚本</a
                >
                ，结合 <code>sqlite3 .backup</code> + <code>rsync</code>）
            </em>。
        </p>
    </div>
</div>

<HeadingLink title="推荐设置" />

<header class="highlighted-title bg-danger-alt m-t-0">
    <span class="label label-primary">强烈推荐</span>
    <HeadingLink title="使用 SMTP 邮件服务器" tag="h5" />
</header>
<p>
    默认情况下，PocketBase 使用 Unix 内置 <code>sendmail</code> 命令发送邮件。
    <br />
    这在开发环境下没问题，但在生产环境中很可能导致邮件被判为垃圾邮件或无法送达。
</p>
<p>
    为避免投递问题，建议使用本地 SMTP 服务器或外部邮件服务，如
    <a href="https://www.mailersend.com/" target="_blank" rel="noreferrer noopener">MailerSend</a>、
    <a href="https://www.brevo.com/" target="_blank" rel="noreferrer noopener">Brevo</a>、
    <a href="https://sendgrid.com/" target="_blank" rel="noreferrer noopener">SendGrid</a>、
    <a href="https://www.mailgun.com/" target="_blank" rel="noreferrer noopener">Mailgun</a>、
    <a href="https://aws.amazon.com/ses/" target="_blank" rel="noreferrer noopener">AWS SES</a> 等。
</p>
<p>
    选定邮件服务后，可在
    <em>
        {`仪表盘 > 设置 > 邮件设置`}
    </em>
    中配置 PocketBase SMTP 设置：
</p>
<img src="/images/screenshots/smtp-settings.png" alt="SMTP settings screenshot" class="screenshot m-b-xs" />

<header class="highlighted-title bg-danger-alt">
    <span class="label label-primary">强烈推荐</span>
    <HeadingLink title="为超级用户启用 MFA" tag="h5" />
</header>
<p>
    作为额外的安全层，你可以为 <code>_superusers</code> 集合启用 MFA 和 OTP 选项，
    这样超级用户登录时会强制要求一次性密码（邮件验证码）。
</p>
<p>
    如果邮件收不到验证码，也可以通过命令
    <code>./pocketbase superuser otp yoursuperuser@example.com</code> 手动生成 OTP。
</p>
<img
    src="/images/screenshots/superusers_mfa.png"
    alt="Superusers MFA settings screenshot"
    class="screenshot m-b-xs"
/>

<header class="highlighted-title bg-danger-alt">
    <span class="label label-primary">强烈推荐</span>
    <HeadingLink title="启用限流器" tag="h5" />
</header>
<p>
    为降低 API 滥用风险（如过多的认证或记录创建请求），建议配置限流器。
</p>
<p>
    PocketBase v0.23.0+ 内置了简单的限流器，已能满足大多数场景。如需更高级功能，也可通过反向代理使用外部限流器。
</p>
<p>
    你可以在
    <em>
        {`仪表盘 > 设置 > 应用`}
    </em>
    中配置内置限流器：
</p>
<img
    src="/images/screenshots/rate-limit-settings.png"
    alt="Rate limit settings screenshot"
    class="screenshot m-b-xs"
/>

<header class="highlighted-title bg-warning-alt">
    <span class="label label-primary">可选</span>
    <HeadingLink title="提升文件描述符限制" tag="h5" />
</header>
<p class="txt-hint txt-bold">
    以下说明适用于 Linux，其他操作系统也有类似机制。
</p>
<p>
    Unix 也会将 <em>“文件描述符”</em> 用于网络连接，大多数系统默认限制约为 1024。
    <br />
    如果你的应用有大量并发实时连接，可能会遇到 <code>Too many open files</code> 错误。
</p>
<p>
    一种缓解方式是通过 <code>ulimit -a</code> 查看当前账户资源限制，并找到你想要修改的参数。例如要提升文件数限制（<em>-n</em>），可在启动 PocketBase 前运行
    <code>ulimit -n 4096</code>。
</p>

<header class="highlighted-title bg-warning-alt">
    <span class="label label-primary">可选</span>
    <HeadingLink title="设置 GOMEMLIMIT" tag="h5" />
</header>
<p>
    如果你运行在内存受限环境下，设置
    <a href="https://pkg.go.dev/runtime#hdr-Environment_Variables" target="_blank" rel="noopener">
        <code>GOMEMLIMIT</code>
    </a>
    环境变量可以帮助防止进程因内存不足（OOM）被终止。它是“软限制”，在某些情况下内存使用仍可能超过，但会让 GC 更“积极”地运行。例如：<code>GOMEMLIMIT=512MiB</code>。
</p>
<p>
    如果设置 <code>GOMEMLIMIT</code> 后仍遇到 OOM 错误，可以尝试启用 swap 分区（如尚未启用），或在
    <a href={import.meta.env.PB_DISCUSSIONS_URL} target="_blank" rel="noopener">Q&A 讨论区</a>
    发帖，附上复现步骤，以便我们改进 PocketBase。
</p>

<header class="highlighted-title bg-warning-alt">
    <span class="label label-primary">可选</span>
    <HeadingLink title="启用设置加密" tag="h5" />
</header>
<p class="txt-bold txt-hint">如果你不确定是否需要，可以忽略以下内容。</p>
<p>
    默认情况下，PocketBase 会以明文 JSON 文本形式将应用设置存储在数据库中，包括 SMTP 密码和 S3 存储凭据。
</p>
<p>
    虽然这本身不是安全问题（PocketBase 应用完全运行在单台服务器上，且仅授权用户可访问你的服务器和应用数据），但在某些情况下，如果有人获取了你的数据库文件（如外部备份），加密存储设置会更安全。
</p>
<p>如需加密存储 PocketBase 设置：</p>
<ol>
    <li class="m-b-10">
        新建一个环境变量，并<strong>设置为随机的 32 位字符串</strong>。
        <br />
        <span class="txt-hint">
            例如在 shell 配置文件中添加
            <code>export PB_ENCRYPTION_KEY="{CommonHelper.randomString(32)}"</code>
        </span>
    </li>
    <li>
        启动应用时加上 <code>--encryptionEnv=YOUR_ENV_VAR</code> 参数。
        <br />
        <span class="txt-hint">
            例如 <code>pocketbase serve --encryptionEnv=PB_ENCRYPTION_KEY</code>
        </span>
    </li>
</ol>