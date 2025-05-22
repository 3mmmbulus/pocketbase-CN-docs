<script>
    const AMD = "amd";
    const ARM = "arm";

    let architecture = getDefault();

    function changePlatform(newPlatform) {
        architecture = newPlatform || getDefault();
    }

    function getDefault() {
        if (typeof window !== "undefined" && window.UA_ARCHITECTURE) {
            return window.UA_ARCHITECTURE === "arm" ? ARM : AMD;
        }

        return AMD;
    }
</script>

<div class="alert alert-danger m-b-sm">
    <div class="icon">
        <i class="ri-alert-line" />
    </div>
    <div class="content">
        <p>
            请注意，PocketBase 仍在积极开发中，在达到 v1.0.0 之前不保证完全向后兼容。PocketBase 暂不推荐用于生产关键应用，除非你愿意阅读
            <a
                href="{import.meta.env.PB_REPO_URL}/blob/master/CHANGELOG.md"
                class="txt-bold"
                target="_blank"
                rel="noopener noreferrer"
            >
                更新日志
            </a>
            并不时手动进行迁移操作。
        </p>
    </div>
</div>

<p>
    PocketBase 是一个开源后端，内置嵌入式数据库（SQLite）、实时订阅、内置身份验证管理、便捷的仪表盘 UI 以及简单的 REST-ish API。它既可作为 Go 框架使用，也可作为独立应用运行。
</p>

<p>最简单的入门方式是下载预编译的 PocketBase 最小可执行文件：</p>

<div class="tabs compact tabs-architecture m-b-sm">
    <div class="tabs-header left">
        <button
            type="button"
            class="tab-item"
            class:active={architecture == AMD}
            on:click|preventDefault={() => changePlatform(AMD)}
        >
            x64
        </button>
        <button
            type="button"
            class="tab-item"
            class:active={architecture == ARM}
            on:click|preventDefault={() => changePlatform(ARM)}
        >
            ARM64
        </button>
    </div>
    <div class="tabs-content">
        <div class="tab-item" class:active={architecture == AMD}>
            <ul>
                <li>
                    <div class="inline-flex flex-gap-5">
                        <a
                            href={import.meta.env.PB_LINUX_AMD_URL}
                            class="inline-flex flex-gap-5 txt-bold"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <i class="ri-qq-fill" />
                            <span class="txt">下载 {import.meta.env.PB_VERSION} Linux x64 版本</span>
                        </a>
                        <small class="txt-hint">（约 {import.meta.env.PB_LINUX_AMD_SIZE}MB zip）</small>
                    </div>
                </li>
                <li>
                    <div class="inline-flex flex-gap-5">
                        <a
                            href={import.meta.env.PB_WINDOWS_AMD_URL}
                            class="inline-flex flex-gap-5 txt-bold"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <i class="ri-windows-fill" />
                            <span class="txt">下载 {import.meta.env.PB_VERSION} Windows x64 版本</span>
                        </a>
                        <small class="txt-hint">（约 {import.meta.env.PB_WINDOWS_AMD_SIZE}MB zip）</small>
                    </div>
                </li>
                <li>
                    <div class="inline-flex flex-gap-5">
                        <a
                            href={import.meta.env.PB_MAC_AMD_URL}
                            class="inline-flex flex-gap-5 txt-bold"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <i class="ri-apple-fill" />
                            <span class="txt">下载 {import.meta.env.PB_VERSION} macOS x64 版本</span>
                        </a>
                        <small class="txt-hint">（约 {import.meta.env.PB_MAC_AMD_SIZE}MB zip）</small>
                    </div>
                </li>
            </ul>
        </div>
        <div class="tab-item" class:active={architecture == ARM}>
            <ul>
                <li>
                    <div class="inline-flex flex-gap-5">
                        <a
                            href={import.meta.env.PB_LINUX_ARM_URL}
                            class="inline-flex flex-gap-5 txt-bold"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <i class="ri-qq-fill" />
                            <span class="txt">下载 {import.meta.env.PB_VERSION} Linux ARM64 版本</span>
                        </a>
                        <small class="txt-hint">（约 {import.meta.env.PB_LINUX_ARM_SIZE}MB zip）</small>
                    </div>
                </li>
                <li>
                    <div class="inline-flex flex-gap-5">
                        <a
                            href={import.meta.env.PB_WINDOWS_ARM_URL}
                            class="inline-flex flex-gap-5 txt-bold"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <i class="ri-windows-fill" />
                            <span class="txt">下载 {import.meta.env.PB_VERSION} Windows ARM64 版本</span>
                        </a>
                        <small class="txt-hint">（约 {import.meta.env.PB_WINDOWS_ARM_SIZE}MB zip）</small>
                    </div>
                </li>
                <li>
                    <div class="inline-flex flex-gap-5">
                        <a
                            href={import.meta.env.PB_MAC_ARM_URL}
                            class="inline-flex flex-gap-5 txt-bold"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <i class="ri-apple-fill" />
                            <span class="txt">下载 {import.meta.env.PB_VERSION} macOS ARM64 版本</span>
                        </a>
                        <small class="txt-hint">（约 {import.meta.env.PB_MAC_ARM_SIZE}MB zip）</small>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>

<p class="txt-sm txt-hint">
    更多平台和详细信息请参见
    <a href={import.meta.env.PB_GITHUB_RELEASES_URL} target="_blank" rel="noreferrer noopener">
        GitHub Releases 页面
    </a>
</p>

<hr />

<p>
    解压后，你可以在解压目录下运行
    <code><strong>./pocketbase serve</strong></code> 启动应用。
</p>
<p>
    <strong>就是这么简单！</strong>
    第一次启动时会生成一个安装链接，并自动在浏览器中打开，用于设置你的第一个超级用户账号
    <small class="txt-hint">
        （你也可以通过
        <code>./pocketbase superuser create EMAIL PASS</code>
        手动创建第一个超级用户）
    </small>。
</p>
<p>启动后的 Web 服务器默认有以下路由：</p>
<div class="alert m-t-10 m-b-xs">
    <div class="content">
        <ul>
            <li class="m-b-5">
                <!-- svelte-ignore security-anchor-rel-noreferrer -->
                <a href="http://127.0.0.1:8090" target="_blank">
                    <code>http://127.0.0.1:8090</code>
                </a>
                - 如果存在 <code>pb_public</code> 目录，则会从中提供静态内容（html、css、图片等）
            </li>
            <li class="m-b-5">
                <!-- svelte-ignore security-anchor-rel-noreferrer -->
                <a href="http://127.0.0.1:8090/_/" target="_blank">
                    <code>http://127.0.0.1:8090/_/</code>
                </a>
                - 超级用户仪表盘
            </li>
            <li>
                <!-- svelte-ignore security-anchor-rel-noreferrer -->
                <a href="http://127.0.0.1:8090/api/" target="_blank">
                    <code>http://127.0.0.1:8090/api/</code>
                </a>
                - REST-ish API
            </li>
        </ul>
    </div>
</div>
<p>预编译的 PocketBase 可执行文件会在可执行文件所在目录下创建和管理两个新目录：</p>
<ul>
    <li>
        <code>pb_data</code> - 存储你的应用数据、上传的文件等（通常应加入 <code>.gitignore</code>）。
    </li>
    <li>
        <code>pb_migrations</code> - 包含你的 collection 变更的 JS 迁移文件（可安全提交到仓库）。
        <br />
        <div class="txt-hint m-b-xs">
            你甚至可以编写自定义迁移脚本。更多信息请查看
            <a href="/docs/js-migrations">JS 迁移文档</a>。
        </div>
    </li>
</ul>
<p>
    你可以通过运行
    <code>./pocketbase --help</code> 或
    <code>./pocketbase [command] --help</code>
    查看所有可用命令及其选项
</p>

<style>
    .tabs-architecture .tabs-header .tab-item {
        min-width: 70px;
    }
</style>
