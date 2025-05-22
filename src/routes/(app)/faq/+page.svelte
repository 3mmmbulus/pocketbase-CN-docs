<svelte:head>
    <title>常见问题 - PocketBase中文文档</title>
</svelte:head>

<div class="page-content">
    <nav class="breadcrumbs">
        <div class="breadcrumb-item" data-pagefind-meta="title">常见问题</div>
    </nav>

    <div class="alert p-sm m-b-10">
        <div class="content">
            <div class="alert alert-danger m-0">
                <div class="content">
                    <h5>0. 为什么？</h5>
                    <p>
                        PocketBase 的创建是为了帮助构建可以在单台服务器上运行的自包含应用，无需额外安装任何东西（<em
                            >参见 <a
                                href="https://github.com/presentator/presentator/issues/183"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                Presentator#183
                            </a></em
                        >）。
                        <br />
                        基本思路是将常见功能如 crud、auth、文件上传、自动 TLS 等开箱即用，让你可以专注于 UI 和实际的业务需求。
                    </p>
                    <p>
                        请注意，PocketBase 既不是创业项目，也不是商业项目。背后没有付费团队或公司。它是一个个人开源项目，范围有意限制，完全由志愿者开发。除了现有内容外，不承诺维护和支持（<em
                            >你可以查看
                            <a
                                href="https://github.com/orgs/pocketbase/projects/2/views/1"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                Roadmap
                            </a>
                            了解项目大致方向，但没有固定时间表</em
                        >）。
                    </p>
                </div>
            </div>

            <h5>1. 你们提供托管服务吗？</h5>
            <p>
                不提供。PocketBase 仅支持自托管。如果你在寻找适合小型 PoC 或兴趣项目的免费选项，可以参考：
            </p>
            <ul>
                <li>
                    <a
                        href="https://cloud.google.com/free/docs/free-cloud-features#compute"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Google Cloud 免费套餐
                    </a>
                    <br />
                    <small>
                        <em>
                            免费套餐 e2-micro 计算实例包含 0.25vCPU、30GB 磁盘存储、1GB 内存和每月 200GB 标准级出口流量，区域需为 us-central1 | us-west1 | us-east1。
                        </em>
                    </small>
                </li>
                <li>
                    <a href="https://www.oracle.com/cloud/free/" target="_blank" rel="noreferrer noopener">
                        Oracle Cloud 永久免费服务
                    </a>
                    <br />
                    <small>
                        <em>
                            提供基于 AMD 和 ARM 的计算实例，不同免费额度和存储选项（注意：有未证实的“非活跃”账户被随机删除的报告）。
                        </em>
                    </small>
                </li>
                <li>
                    <a
                        href="https://community.ibm.com/zsystems/form/l1cc-oss-vm-request/"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        IBM LinuxONE 开源社区云
                    </a>
                    <br />
                    <small>
                        <em> 免费 IBM Z (s390x) 虚拟机，适用于开源项目（需填写表单）。 </em>
                    </small>
                </li>
            </ul>
            <p>
                如果需要更传统的方案，可以选择任何带有持久存储的 VPS 服务商，例如：
                <a href="https://www.hetzner.com/" target="_blank" rel="noreferrer noopener">Hetzner</a>、
                <a href="https://www.vultr.com/" target="_blank" rel="noreferrer noopener">Vultr</a>、
                <a href="https://upcloud.com/" target="_blank" rel="noreferrer noopener">UpCloud</a>、
                <a href="https://www.linode.com/" target="_blank" rel="noreferrer noopener">Linode</a>、
                <a href="https://www.digitalocean.com/" target="_blank" rel="noreferrer noopener"
                    >DigitalOcean</a
                > 等。
                <br />
                <a href="/docs/going-to-production/">生产环境部署指南</a> 提供了部署 PocketBase 应用及相关配置建议的信息。
            </p>

            <h5>2. 能扩展吗？</h5>
            <p>
                仅支持单台服务器（即垂直扩展）。大多数情况下，你可能并不需要为后端管理一堆机器和服务的复杂性。
                <br />
                <strong>PocketBase 非常适合小型和中型应用</strong>
                ——如 SaaS、移动 API 后端、内网等。
                <br />
                即使没有优化，PocketBase 也可以在一台便宜的 $4 Hetzner CAX11 VPS（2vCPU，4GB RAM）上轻松支持 10,000+ 持久实时连接。
                <br />
                你可以在官方
                <a href={import.meta.env.PB_BENCHMARKS_URL} target="_blank" rel="noreferrer noopener">
                    性能测试仓库
                </a>
                查看各种读写操作的性能测试。
                <br />
                目前还有优化空间（<em>我还没有做过深入的性能分析</em>），但现有性能已经足够满足 PocketBase 目标应用的需求。
            </p>

            <h5>3. 如何运行自定义代码？</h5>
            <p>
                PocketBase 与 Firebase、Supabase、Nhost 等类似后端解决方案不同，不支持运行云函数。
                <br />
                <strong>
                    相反，PocketBase 可以作为 Go 或 JS 框架使用，让你能够构建自己的业务逻辑，同时拥有一个可移植的后端
                </strong>
                （详见 <a href="/docs/use-as-framework">Use as framework</a> 指南）。
            </p>

            <h5>4. 支持 Google 或 Facebook 登录吗？</h5>
            <p>
                支持，目前已支持 15+ 个 OAuth2 提供商——Apple、Google、Facebook、Microsoft、VK、GitHub、GitLab 等等。
            </p>

            <h5>5. 是否自带用户登录、注册等前端界面？</h5>
            <p>
                不自带。PocketBase 只提供客户端集成的 SDK，你可以自由实现自己的前端。
                <br />
                为方便起见，系统默认提供了用户邮箱确认链接（如密码重置、验证等）的页面，但你也可以在邮件模板集合设置中自定义这些链接。
            </p>

            <h5>6. 可以用 X 数据库吗？</h5>
            <p>
                不可以，至少默认不支持。PocketBase 使用嵌入式 SQLite（WAL 模式），暂无支持其他数据库的计划。
                <br />
                <strong>
                    对于大多数查询，SQLite（WAL 模式）在性能上优于传统数据库如 MySQL、MariaDB 或 PostgreSQL（尤其是读操作）。
                </strong>
                <br />
                如果你需要复制和灾备，可以搭配
                <a href="https://litestream.io/" target="_blank" rel="noreferrer noopener">Litestream</a> 使用。
            </p>

            <h5>7. 如何导入/导出 PocketBase 的数据？</h5>
            <p>
                目前没有内置的数据导入/导出工具，但你可以参考
                <a
                    class="txt-bold"
                    href="https://github.com/pocketbase/pocketbase/discussions/6287"
                    target="_blank"
                    rel="noopener noreferrer">discussions#6287</a
                > 中提到的一些建议。
            </p>

            <h5>8. 可以捐赠吗？</h5>
            <p>
                不可以。过去曾接受过捐赠（非常感谢所有支持者），但个人捐赠通常会带来一些“无形的期望”，为了避免心理负担和因未能满足捐赠者需求而产生的愧疚感，我决定不再接受 PocketBase 的捐赠。
                <br />
                如果你所在的组织有赞助或资助计划，想要无附加条件地支持项目开发，可以联系
                <em>support at pocketbase.io</em>。
            </p>

            <h5>9. 哪里可以获得 PocketBase 应用的帮助？</h5>
            <p>
                你可以随时在我们的公开
                <a href={import.meta.env.PB_DISCUSSIONS_URL} target="_blank" rel="noreferrer noopener"
                    >Discussions 讨论区</a
                >、
                <a href={import.meta.env.PB_REPO_URL}>提交 issue</a>
                或联系 <em>support at pocketbase.io</em>。
            </p>
        </div>
    </div>
</div>
