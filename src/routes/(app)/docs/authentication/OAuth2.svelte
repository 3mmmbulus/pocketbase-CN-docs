<script>
    import tooltip from "@/actions/tooltip";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import { indexExample, redirectExample } from "./oauth2Examples.js";

    const TAB_ALL_IN_ONE = "all_in_one";
    const TAB_MANUAL_CODE = "manual";

    let activeTab = TAB_ALL_IN_ONE;
</script>

<div class="alert alert-info m-t-10 m-b-10">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            开始之前，你需要在第三方提供商的后台创建一个 OAuth2 应用，以获取
            <strong>Client Id</strong> 和 <strong>Client Secret</strong>，并注册一个重定向 URL
            <i
                class="ri-question-line link-hint"
                use:tooltip={`For the "All in one" flow it should be \nhttps://yourdomain.com/api/oauth2-redirect.` +
                    `\n\n` +
                    `For the "Manual code exchange" flow, the redirect URL is your own custom endpoint.`}
            />。
        </p>
        <p>
            获得 <strong>Client Id</strong> 和 <strong>Client Secret</strong> 后，你可以在 PocketBase 认证集合选项中启用并配置该提供商（<em class="txt-sm"
                >PocketBase {">"} Collections {">"}
                {"{YOUR_COLLECTION}"}
                {">"} Edit collection (settings cogwheel) {">"} Options
                {">"} OAuth2</em
            >）。
        </p>
    </div>
</div>

<div class="tabs">
    <div class="tabs-header compact left">
        <button
            class="tab-item active"
            class:active={activeTab === TAB_ALL_IN_ONE}
            on:click={() => (activeTab = TAB_ALL_IN_ONE)}
        >
            一体化流程（<em>推荐</em>）
        </button>
        <button
            class="tab-item active"
            class:active={activeTab === TAB_MANUAL_CODE}
            on:click={() => (activeTab = TAB_MANUAL_CODE)}
        >
            手动 code 交换
        </button>
    </div>
    <div class="tabs-content">
        <div class="tab-item" class:active={activeTab === TAB_ALL_IN_ONE}>
            <p>
                此方法在一次调用中完成所有操作，无需自定义重定向、deeplink 或页面刷新。
            </p>
            <p>
                <strong>
                    创建 OAuth2 应用时，回调/重定向 URL 必须使用
                    <code class="txt-bold">https://yourdomain.com/api/oauth2-redirect</code>
                </strong>
                （<em>
                    本地测试时可用 <code>http://127.0.0.1:8090/api/oauth2-redirect</code>
                </em>）。
            </p>

            <div class="clearfix m-b-xs" />
            <!-- prettier-ignore -->
            <CodeTabs
                js={`
                    import PocketBase from 'pocketbase';

                    const pb = new PocketBase('https://pocketbase.io');

                    ...

                    // This method initializes a one-off realtime subscription and will
                    // open a popup window with the OAuth2 vendor page to authenticate.
                    //
                    // Once the external OAuth2 sign-in/sign-up flow is completed, the popup
                    // window will be automatically closed and the OAuth2 data sent back
                    // to the user through the previously established realtime connection.
                    //
                    // If the popup is being blocked on Safari, you can try the suggestion from:
                    // https://github.com/pocketbase/pocketbase/discussions/2429#discussioncomment-5943061.
                    const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });

                    // after the above you can also access the auth data from the authStore
                    console.log(pb.authStore.isValid);
                    console.log(pb.authStore.token);
                    console.log(pb.authStore.record.id);

                    // "logout" the last authenticated record
                    pb.authStore.clear();
                `}
                dart={`
                    import 'package:pocketbase/pocketbase.dart';
                    import 'package:url_launcher/url_launcher.dart';

                    final pb = PocketBase('https://pocketbase.io');

                    ...

                    // This method initializes a one-off realtime subscription and will
                    // call the provided urlCallback with the OAuth2 vendor url to authenticate.
                    //
                    // Once the external OAuth2 sign-in/sign-up flow is completed, the browser
                    // window will be automatically closed and the OAuth2 data sent back
                    // to the user through the previously established realtime connection.
                    final authData = await pb.collection('users').authWithOAuth2('google', (url) async {
                      // or use something like flutter_custom_tabs to make the transitions between native and web content more seamless
                      await launchUrl(url);
                    });

                    // after the above you can also access the auth data from the authStore
                    print(pb.authStore.isValid);
                    print(pb.authStore.token);
                    print(pb.authStore.record.id);

                    // "logout" the last authenticated record
                    pb.authStore.clear();
                `}
            />
        </div>
        <div class="tab-item" class:active={activeTab === TAB_MANUAL_CODE}>
            <p>手动使用 OAuth2 code 认证时，你需要准备 2 个端点：</p>
            <ul>
                <li>用于展示“使用...登录”链接的页面</li>
                <li>
                    用于处理第三方重定向并交换 code 为 token 的页面
                </li>
            </ul>
            <p>以下是一个简单的网页示例：</p>
            <ol>
                <li class="m-b-xs">
                    <p>
                        <strong>链接页面</strong>
                        （如 https://127.0.0.1:8090，服务 <code>pb_public/index.html</code>）：
                    </p>
                    <CodeBlock language="html" content={indexExample} />
                </li>
                <li class="m-b-xs">
                    <p>
                        <strong>重定向处理页面</strong>
                        （如 https://127.0.0.1:8090/redirect.html，服务
                        <code>pb_public/redirect.html</code>）：
                    </p>
                    <CodeBlock language="html" content={redirectExample} />
                </li>
            </ol>

            <div class="alert alert-info m-t-xs">
                <div class="icon">
                    <i class="ri-information-line" />
                </div>
                <div class="content">
                    <p>
                        使用 Apple 登录时，如果采用“手动 code 交换”流程，重定向处理页面必须支持 <code>POST</code> 请求，以便接收 Apple 用户的姓名和邮箱。如果只需要 Apple 用户 id，可以保持重定向处理页面为 <code>GET</code>，但需将 Apple 授权 url 中的 <code>response_mode=form_post</code> 替换为 <code>response_mode=query</code>。
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
