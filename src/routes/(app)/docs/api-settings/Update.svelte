<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import FieldsQueryParam from "@/components/FieldsQueryParam.svelte";

    const responses = [
        {
            code: 200,
            body: `
                {
                  "smtp": {
                    "enabled": false,
                    "port": 587,
                    "host": "smtp.example.com",
                    "username": "",
                    "authMethod": "",
                    "tls": true,
                    "localName": ""
                  },
                  "backups": {
                    "cron": "0 0 * * *",
                    "cronMaxKeep": 3,
                    "s3": {
                      "enabled": false,
                      "bucket": "",
                      "region": "",
                      "endpoint": "",
                      "accessKey": "",
                      "forcePathStyle": false
                    }
                  },
                  "s3": {
                    "enabled": false,
                    "bucket": "",
                    "region": "",
                    "endpoint": "",
                    "accessKey": "",
                    "forcePathStyle": false
                  },
                  "meta": {
                    "appName": "Acme",
                    "appURL": "https://example.com",
                    "senderName": "Support",
                    "senderAddress": "support@example.com",
                    "hideControls": false
                  },
                  "rateLimits": {
                    "rules": [
                      {
                        "label": "*:auth",
                        "audience": "",
                        "duration": 3,
                        "maxRequests": 2
                      },
                      {
                        "label": "*:create",
                        "audience": "",
                        "duration": 5,
                        "maxRequests": 20
                      },
                      {
                        "label": "/api/batch",
                        "audience": "",
                        "duration": 1,
                        "maxRequests": 3
                      },
                      {
                        "label": "/api/",
                        "audience": "",
                        "duration": 10,
                        "maxRequests": 300
                      }
                    ],
                    "enabled": false
                  },
                  "trustedProxy": {
                    "headers": [],
                    "useLeftmostIP": false
                  },
                  "batch": {
                    "enabled": true,
                    "maxRequests": 50,
                    "timeout": 3,
                    "maxBodySize": 0
                  },
                  "logs": {
                    "maxDays": 7,
                    "minLevel": 0,
                    "logIP": true,
                    "logAuthId": false
                  }
                }
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "An error occurred while submitting the form.",
                  "data": {
                    "meta": {
                      "appName": {
                        "code": "validation_required",
                        "message": "Missing required value."
                      }
                    }
                  }
                }
            `,
        },
        {
            code: 401,
            body: `
                {
                  "status": 401,
                  "message": "The request requires valid record authorization token.",
                  "data": {}
                }
            `,
        },
        {
            code: 403,
            body: `
                {
                  "status": 403,
                  "message": "The authorized record is not allowed to perform this action.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="更新设置">
    <div class="content m-b-sm">
        <p>批量更新应用设置并返回更新后的设置列表。</p>
        <p>仅超级用户可以执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '123456');

            const settings = await pb.settings.update({
                meta: {
                  appName: 'YOUR_APP',
                  appUrl: 'http://127.0.0.1:8090',
                },
            });
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '123456');

            final settings = await pb.settings.update(body: {
                'meta': {
                  'appName': 'YOUR_APP',
                  'appUrl': 'http://127.0.0.1:8090',
                },
            });
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-warning">
        <strong class="label label-primary">PATCH</strong>
        <div class="content">/api/settings</div>
        <small class="txt-hint auth-header">需要 <code>Authorization:TOKEN</code></small>
    </div>

    <div class="section-title">请求体参数</div>
    <table class="table-compact table-border">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="50%">说明</th>
            </tr>
        </thead>
        <tbody>
            <!-- meta -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>meta</strong>
                    <br />
                    <small class="txt-hint">应用元数据（名称、URL、支持邮箱等）。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>appName</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>应用名称。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>appUrl</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>应用对外公开的绝对 URL。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>hideControls</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>
                    隐藏后台的集合创建和更新控件。
                    <small>
                        适用于生产环境防止误操作更改数据结构。
                    </small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>senderName</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>事务邮件发送人名称。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>senderAddress</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>事务邮件发送人邮箱。</td>
            </tr>

            <!-- logs -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>logs</strong>
                    <br />
                    <small class="txt-hint">应用日志设置。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>maxDays</em>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>最大日志保留天数。设置为 <em>0</em> 表示不保留日志。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>minLevel</em>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>
                    指定日志持久化的最低级别。
                    <br />
                    默认日志级别如下：
                    <ul>
                        <li>-4: DEBUG</li>
                        <li>0: INFO</li>
                        <li>4: WARN</li>
                        <li>8: ERROR</li>
                    </ul>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>logIP</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>启用后将在活动请求日志中包含客户端 IP。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>logAuthId</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>启用后将在活动请求日志中包含认证记录 id。</td>
            </tr>

            <!-- backups -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>backups</strong>
                    <br />
                    <small class="txt-hint">应用数据备份设置。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>cron</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>自动备份的 cron 表达式，例如 <code>0 0 * * *</code>。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>cronMaxKeep</em>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>自动备份最多保留的数量，超出后会删除旧备份。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>s3</em>
                    </div>
                </td>
                <td>
                    <span class="label">Object</span>
                </td>
                <td>S3 配置（字段同 S3 文件存储设置）。</td>
            </tr>

            <!-- smtp -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>smtp</strong>
                    <br />
                    <small class="txt-hint">SMTP 邮件服务器设置。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>enabled</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>启用 SMTP 邮件服务器发送邮件。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>host</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>邮件服务器主机（启用 SMTP 时必填）。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>port</em>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>邮件服务器端口（启用 SMTP 时必填）。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>username</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>邮件服务器用户名。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>password</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>邮件服务器密码。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>tls</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>
                    是否强制使用 TLS 加密连接。
                    <br />
                    <small class="txt-hint">
                        当为 <em>false</em> 时会发送 <em>StartTLS</em> 命令，由服务器决定是否升级连接。
                    </small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>authMethod</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    SMTP 认证方式 - <em>PLAIN</em> 或 <em>LOGIN</em>（主要用于 Microsoft）。
                    <br />
                    留空时默认为 <em>PLAIN</em>。
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>localName</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    用于初始 EHLO/HELO 交换的可选域名或 IP 地址。
                    <br />
                    未设置时默认使用 <code>localhost</code>。
                    <br />
                    注意部分 SMTP 服务商（如 Gmail SMTP-relay）要求填写有效域名，否则会拒绝使用 localhost。
                </td>
            </tr>

            <!-- s3 -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>s3</strong>
                    <br />
                    <small class="txt-hint">S3 兼容文件存储设置。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>enabled</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>启用 S3 兼容存储。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>bucket</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>S3 存储桶（启用时必填）。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>region</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>S3 存储区域（启用时必填）。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>endpoint</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>S3 存储公开 endpoint（启用时必填）。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>accessKey</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>S3 存储 access key（启用时必填）。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>secret</em>
                    </div>
                </td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>S3 存储 secret（启用时必填）。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>forcePathStyle</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>
                    强制 S3 请求使用 path-style 访问方式，例如
                    "https://s3.amazonaws.com/BUCKET/KEY"，而不是默认的
                    "https://BUCKET.s3.amazonaws.com/KEY"。
                </td>
            </tr>

            <!-- batch -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>batch</strong>
                    <br />
                    <small class="txt-hint">批量日志设置。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>enabled</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>启用批量 Web API。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>maxRequests</em>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>允许的最大批量请求数。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-success">必填</span>
                        <em>timeout</em>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>批量事务最大等待秒数，超时自动取消。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>maxBodySize</em>
                    </div>
                </td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>
                    批量请求体最大允许字节数。
                    <br />
                    未设置时默认最大约 128MB。
                </td>
            </tr>

            <!-- rateLimits -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>rateLimits</strong>
                    <br />
                    <small class="txt-hint">限流器设置。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>enabled</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>启用内置限流器。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>rules</em>
                    </div>
                </td>
                <td>
                    <span class="label">{`Array<RateLimitRule>`}</span>
                </td>
                <td>
                    限流规则列表。每条规则包含：
                    <ul>
                        <li>
                            <code>label</code> - 规则标识符。
                            <br />
                            可以是标签、完整路径或以 `/` 结尾的路径前缀。
                        </li>
                        <li><code>maxRequests</code> - 每个周期允许的最大请求数。</li>
                        <li>
                            <code>duration</code> - 指定每隔多少秒重置计数/令牌。
                        </li>
                    </ul>
                </td>
            </tr>

            <!-- trustedProxy -->
            <tr>
                <td colspan="3" class="bg-info-alt">
                    <strong>trustedProxy</strong>
                    <br />
                    <small class="txt-hint">可信代理头设置。</small>
                </td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">├─</span>
                        <span class="label label-warning">可选</span>
                        <em>headers</em>
                    </div>
                </td>
                <td>
                    <span class="label">{`Array<String>`}</span>
                </td>
                <td>需要检查的显式可信 header 列表。</td>
            </tr>
            <tr>
                <td class="min-width">
                    <div class="inline-flex flex-nowrap">
                        <span class="txt">└─</span>
                        <span class="label label-warning">可选</span>
                        <em>useLeftmostIP</em>
                    </div>
                </td>
                <td>
                    <span class="label">Boolean</span>
                </td>
                <td>指定是否使用最左侧的 IP。</td>
            </tr>
        </tbody>
    </table>
    <small class="block txt-hint m-t-10 m-b-base">
        请求体参数可通过 <em>JSON</em> 或
        <em>multipart/form-data</em> 方式发送。
    </small>

    <div class="section-title">查询参数</div>
    <table class="table-compact table-border m-b-base">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="50%">说明</th>
            </tr>
        </thead>
        <tbody>
            <FieldsQueryParam />
        </tbody>
    </table>

    <div class="section-title">响应</div>
    <div class="tabs">
        <div class="tabs-header compact combined left">
            {#each responses as response (response.code)}
                <button
                    class="tab-item"
                    class:active={responseTab === response.code}
                    on:click={() => (responseTab = response.code)}
                >
                    {response.code}
                </button>
            {/each}
        </div>
        <div class="tabs-content">
            {#each responses as response (response.code)}
                <div class="tab-item" class:active={responseTab === response.code}>
                    <CodeBlock content={response.body} />
                </div>
            {/each}
        </div>
    </div>
</Accordion>
