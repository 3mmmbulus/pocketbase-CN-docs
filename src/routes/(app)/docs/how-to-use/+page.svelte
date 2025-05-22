<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import Accordion from "@/components/Accordion.svelte";
</script>

<p>
    使用 PocketBase 最简单的方法是直接从客户端（如移动应用或浏览器 SPA）与其 Web API 交互。
</p>
<p>
    PocketBase 正是为这种用例设计的，这也是为什么它提供了通用的 JSON API，用于列表、分页、排序、过滤等操作。
</p>
<p>
    数据的访问和过滤控制通常通过
    <a href="/docs/api-rules-and-filters/">collection API rules</a>
    完成。
</p>
<p>
    当你需要更专业的处理（如发送邮件、拦截默认操作、创建新路由等）时，可以
    <a href="/docs/use-as-framework/">使用 Go 或 JavaScript 扩展 PocketBase</a>
    。
</p>
<p>
    与
    <a href="/docs/api-records/">Web API</a>
    交互时，你可以使用官方 SDK 客户端：
</p>
<ul>
    <li>
        <a href={import.meta.env.PB_JS_SDK_URL} class="txt-bold" target="_blank" rel="noreferrer noopener">
            JavaScript SDK
        </a>
        <span class="txt">(浏览器, Node.js, React Native)</span>
    </li>
    <li>
        <a href={import.meta.env.PB_DART_SDK_URL} class="txt-bold" target="_blank" rel="noreferrer noopener">
            Dart SDK
        </a>
        <span class="txt">(Web, 移动端, 桌面端, CLI)</span>
    </li>
</ul>
<p class="txt-hint txt-sm">
    在客户端使用时，整个应用生命周期内只需一个全局 SDK 实例即可，且是安全的。
</p>

<div class="accordions m-t-sm m-b-sm">
    <Accordion single title="Web 应用推荐">
        <p>
            也许不是所有人都同意，但如果你使用 PocketBase 构建 Web 应用，建议将前端开发为<strong>传统的客户端 SPA</strong>。如需额外的服务端处理（如支付回调、额外数据校验等），你可以尝试：
        </p>
        <ul>
            <li>
                <a href="/docs/use-as-framework">将 PocketBase 作为 Go/JS 框架</a> 创建新路由或拦截已有路由。
            </li>
            <li>
                <p>
                    创建一次性的 Node.js/Bun/Deno 等服务端操作，仅以超级用户身份与 PocketBase 交互，并作为纯数据存储（类似传统数据库交互，但通过 HTTP）。此时可以安全地拥有一个全局超级用户客户端，例如：
                </p>

                <CodeBlock
                    language="javascript"
                    content={`
                    // src/superuser.js
                    import PocketBase from "pocketbase"

                    const superuserClient = new PocketBase('https://example.com');

                    // disable autocancellation so that we can handle async requests from multiple users
                    superuserClient.autoCancellation(false);

                    // option 1: authenticate as superuser using email/password (could be filled with ENV params)
                    await superuserClient.collection('_superusers').authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASS, {
                      // This will trigger auto refresh or auto reauthentication in case
                      // the token has expired or is going to expire in the next 30 minutes.
                      autoRefreshThreshold: 30 * 60
                    })

                    // option 2: OR authenticate as superuser via long-lived "API key"
                    // (see https://pocketbase.io/docs/authentication/#api-keys)
                    superuserClient.authStore.save('YOUR_GENERATED_SUPERUSER_TOKEN')

                    export default superuserClient;
                `}
                />
                <p>
                    然后你可以在服务端操作中直接导入该文件，并像平常一样使用该客户端：
                </p>
                <CodeBlock
                    language="javascript"
                    content={`
                    import superuserClient from './src/superuser.js'

                    async function serverAction(req, resp) {
                      ... do some extra data validations or handling ...

                      // send a create request as superuser
                      await superuserClient.collection('example').create({ ... })
                    }
                `}
                />
            </li>
        </ul>
    </Accordion>

    <Accordion single title="为什么不推荐 JS SSR">
        <p>
            将 PocketBase 与 SvelteKit、Nuxt、Next.js 等元框架<strong>以 JS SSR 模式</strong>结合是可行的，但会带来许多复杂性。你需要仔细评估是否值得让另一个后端（PocketBase）与现有后端（Node.js 服务器）并存。
        </p>
        <p>
            你可以在
            <a
                href="https://github.com/pocketbase/pocketbase/discussions/5313"
                target="_blank"
                rel="noopener noreferrer"
            >
                JS SSR - issues and recommendations #5313
            </a> 阅读更多潜在问题，常见陷阱包括：
        </p>
        <ul>
            <li>
                在长时间运行的服务端环境中，错误初始化和共享 JS SDK 实例导致的安全问题。
            </li>
            <li>
                与仅服务端 OAuth2 流程相关的集成困难（或混合“全包”客户端处理并与服务端共享 cookie）。
            </li>
            <li>
                需要代理实时连接，实际上重复了 PocketBase 已经做的事情。
            </li>
            <li>
                由于 Node.js 默认单线程和服务端渲染带来的性能瓶颈，以及不同层之间频繁的请求通信（{`client<->Node.js<->PocketBase`}）导致资源消耗过大。
            </li>
        </ul>
        <p>
            这并不意味着用 JS SSR 结合 PocketBase 总是“不好”，但根据目前报告的诸多问题，建议仅在充分评估后、并且对所用工具及其权衡有深入理解的开发者使用。如果你仍希望用 PocketBase 结合 JS SSR 元框架处理普通用户认证，可以在仓库的
            <a
                href="https://github.com/pocketbase/js-sdk#ssr-integration"
                target="_blank"
                rel="noopener noreferrer"
            >
                JS SSR integration section
            </a>
            找到一些 JS SDK 示例。
        </p>
    </Accordion>

    <Accordion single title="为什么不推荐 htmx、Hotwire/Turbo、Unpoly 等">
        <p>
            htmx、Hotwire/Turbo、Unpoly 等类似工具常用于构建服务端渲染应用，但它们与 PocketBase 的 JSON API 及完全无状态特性并不兼容。
        </p>
        <p>
            虽然可以与 PocketBase 搭配使用，但目前不推荐，因为缺乏构建 SSR 优先应用所需的辅助工具和中间件，这意味着你可能需要从零开始实现很多功能，比如处理 cookie 的中间件（<em>还可能需要处理 CORS 和 CSRF</em>）或自定义认证端点和访问控制（<em
                >collection API rules 仅适用于内置 JSON 路由</em
            >）。
        </p>
        <p>
            未来我们可能会为这种用例提供官方 SSR 支持（如指南和中间件），但再次强调——PocketBase 并非为此设计，你可能需要重新评估技术栈，选择传统客户端 SPA 或更适合你场景的后端方案。
        </p>
    </Accordion>

    <Accordion single title="移动端应用认证持久化">
        <p>
            使用 JavaScript SDK 或 Dart SDK 构建移动应用时，如果希望在不同 app 活动和打开/关闭状态间保持认证，需要指定自定义持久化存储。
        </p>
        <p>
            SDK 提供了异步存储实现，允许你接入任何自定义持久化层（本地文件、SharedPreferences、键值数据库等）。以下是 React Native（JavaScript）和 Flutter（Dart）的 PocketBase SDK 初始化示例：
        </p>
        <!-- prettier-ignore -->
        <CodeTabs
            class="m-b-xs"
            js={`
                // Node.js and React Native doesn't have native EventSource implementation
                // so in order to use the realtime subscriptions you'll need to load EventSource polyfill,
                // for example: npm install react-native-sse --save
                import eventsource from 'react-native-sse';

                import AsyncStorage from '@react-native-async-storage/async-storage';

                import PocketBase, { AsyncAuthStore } from 'pocketbase';

                // load the polyfill
                global.EventSource = eventsource;

                // initialize the async store
                const store = new AsyncAuthStore({
                    save:    async (serialized) => AsyncStorage.setItem('pb_auth', serialized),
                    initial: AsyncStorage.getItem('pb_auth'),
                });

                // initialize the PocketBase client
                // (it is OK to have a single/global instance for the duration of your application)
                const pb = new PocketBase('http://127.0.0.1:8090', store);

                ...

                await pb.collection('users').authWithPassword('test@example.com', '1234567890');

                console.log(pb.authStore.record)
            `}
            dart={`
                import 'package:pocketbase/pocketbase.dart';
                import 'package:shared_preferences/shared_preferences.dart';

                // for simplicity we are using a simple SharedPreferences instance
                // but you can also replace it with its safer EncryptedSharedPreferences alternative
                final prefs = await SharedPreferences.getInstance();

                // initialize the async store
                final store = AsyncAuthStore(
                 save:    (String data) async => prefs.setString('pb_auth', data),
                 initial: prefs.getString('pb_auth'),
                );

                // initialize the PocketBase client
                // (it is OK to have a single/global instance for the duration of your application)
                final pb = PocketBase('http://127.0.0.1:8090', authStore: store);

                ...

                await pb.collection('users').authWithPassword('test@example.com', '1234567890');

                print(pb.authStore.record);
            `}
        />
    </Accordion>

    <Accordion single title="React Native 在 Android 和 iOS 上的文件上传">
        <p>
            截至目前，React Native 在 Android 和 iOS 上的 <code>FormData</code> 实现并不标准，因此在这些平台上传文件时需要如下特殊对象格式：
        </p>
        <CodeBlock
            class="m-0"
            language="javascript"
            content={`
                {
                  uri: "...",
                  type: "...",
                  name: "..."
                }
            `}
        />
        <p>换句话说，你可能需要类似如下的条件处理：</p>
        <CodeBlock
            language="javascript"
            content={`
                const data = new FormData();

                // result is the resolved promise of ImagePicker.launchImageLibraryAsync
                let imageUri = result.assets[0].uri;

                if (Platform.OS === 'web') {
                  const req = await fetch(imageUri);
                  const blob = await req.blob();
                  data.append('avatar', blob); // regular File/Blob value
                } else {
                  // the below object format works only on Android and iOS
                  // (FormData.set() also doesn't seem to be supported so we use FormData.append())
                  data.append('avatar', {
                    uri:  imageUri,
                    type: 'image/*',
                    name: imageUri.split('/').pop(),
                  });
                }

                ...

                await pb.collection('example').create(data)
            `}
        />
    </Accordion>
</div>

<p>
    接下来的几页将介绍 PocketBase 的基础组件，如 collections、records、authentication、relations、文件处理等。
</p>
