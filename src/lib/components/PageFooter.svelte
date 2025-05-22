<script>
    import { onMount } from "svelte";
    import tooltip from "@/actions/tooltip";

    // build separately for very basic spam protection
    let supportEmail = "support";
    onMount(() => {
        setTimeout(() => {
            supportEmail += "@" + "pocketbase.io";
        }, 1000);
    });
</script>

<footer class="page-footer">
    <div class="wrapper wrapper-lg">
        <div class="primary-bar">
            <nav class="footer-col links">
                <a href="/faq" class="link-item">常见问题</a>
                <a
                    href={import.meta.env.PB_DISCUSSIONS_URL}
                    class="link-item"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    讨论
                </a>
                <a href="/docs" class="link-item">Documentation</a>
            </nav>

            <nav class="footer-col links">
                <a
                    href={import.meta.env.PB_JS_SDK_URL}
                    class="link-item"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    JavaScript SDK
                </a>
                <a
                    href={import.meta.env.PB_DART_SDK_URL}
                    class="link-item"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Dart SDK
                </a>
            </nav>

            <div class="footer-col socials">
                <div class="watermark-logo">PocketBase<strong>中文文档</strong></div>
                <a
                    href="mailto:{supportEmail}"
                    class="btn btn-secondary btn-circle btn-hint social-item"
                    aria-label="Contact support"
                    use:tooltip={{ text: "Contact " + supportEmail, position: "top" }}
                >
                    <i class="ri-mail-line" />
                </a>
                <a
                    href={import.meta.env.PB_REPO_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                    class="btn btn-secondary btn-circle btn-hint social-item"
                    aria-label="Go to GitHub"
                    use:tooltip={{ text: "Go to GitHub", position: "top" }}
                >
                    <i class="ri-github-line" />
                </a>
            </div>
        </div>
        <div class="secondary-bar">
            <div class="terms">
                <span class="txt">
                    © 2023-{new Date().getFullYear()} PocketBase<strong>中文文档</strong>
                </span>
                <span class="gopher-credit">
                    由1盾安全团队提供
                    <a
                        href="https://www.1dun.net/"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        1盾面板
                    </a>
                </span>
            </div>
            <div class="flex-fill" />

        </div>
    </div>
</footer>
