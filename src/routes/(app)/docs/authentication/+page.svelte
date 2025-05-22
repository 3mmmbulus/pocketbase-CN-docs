<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import Toc from "@/components/Toc.svelte";
    import OAuth2 from "./OAuth2.svelte";
</script>

<Toc />

<HeadingLink title="概述" />
<p>
    只要客户端在请求中携带有效的 <code>Authorization:YOUR_AUTH_TOKEN</code> 头部，即视为已认证。
</p>
<p>
    PocketBase 的 Web API 完全是无状态的，没有传统意义上的会话（即使 token 也不会存储在数据库中）。
</p>
<p>
    由于没有会话且服务器不存储 token，因此也没有登出接口。要“登出”用户，只需在本地状态中忽略该 token（比如使用 SDK 时调用 <code>pb.authStore.clear()</code>）。
</p>
<p>
    认证 token 可以通过特定的认证集合 Web API 生成，也可以通过 Go/JS 以编程方式生成。
</p>
<p>
    所有允许的认证集合方法都可以在对应的认证集合选项中单独配置。
</p>

<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            请注意，PocketBase 管理员（即 <code>_superusers</code>）与普通认证集合记录类似，但有两点不同：
        </p>
        <ul>
            <li><code>_superusers</code> 集合不支持 OAuth2 作为认证方式</li>
            <li>超级用户可以访问和修改所有内容（集合 API 规则会被忽略）</li>
        </ul>
    </div>
</div>

<HeadingLink title="密码认证" />
<div class="content m-b-xs">
    <p>
        要使用密码认证，必须启用 <em>Identity/Password</em> 认证集合选项
        <em>
            （详见
            <a href="/docs/api-records/#auth-with-password" target="_blank" class="txt-sm"
                >Web API 参考
            </a>
            ）
        </em>。
    </p>
    <p>
        默认的身份字段是 <code>email</code>，但你也可以配置其他唯一字段如“username”（该字段必须有唯一索引）。
    </p>
</div>
<!-- prettier-ignore -->
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        const authData = await pb.collection("users").authWithPassword('test@example.com', '1234567890');

        // after the above you can also access the auth data from the authStore
        console.log(pb.authStore.isValid);
        console.log(pb.authStore.token);
        console.log(pb.authStore.record.id);

        // "logout" the last authenticated record
        pb.authStore.clear();
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        final authData = await pb.collection("users").authWithPassword('test@example.com', '1234567890');

        // after the above you can also access the auth data from the authStore
        print(pb.authStore.isValid);
        print(pb.authStore.token);
        print(pb.authStore.record.id);

        // "logout" the last authenticated record
        pb.authStore.clear();
    `}
/>

<HeadingLink title="OTP 认证" />
<div class="content m-b-xs">
    <p>
        要使用邮箱验证码认证，必须启用 <em>一次性密码（OTP）</em>
        认证集合选项
        <em>
            （详见
            <a href="/docs/api-records/#auth-with-otp" target="_blank" class="txt-sm">Web API 参考 </a>
            ）
        </em>。
    </p>
    <p>
        通常流程是用户手动输入收到的邮箱验证码，你也可以在集合选项中调整默认邮件模板，并添加包含 OTP 及其 id 作为查询参数的 url
        <em>
            （你可以使用 <code>{`{OTP}`}</code> 和 <code>{`{OTP_ID}`}</code> 占位符）
        </em>。
    </p>
    <p>
        注意：请求 OTP 时，即使提供的邮箱不存在，也会返回 <code>otpId</code>，以实现简单的枚举保护（不会创建或发送任何内容）。
    </p>
    <p>
        成功验证 OTP 后，相关用户邮箱会被自动标记为“已验证”。
    </p>
</div>
<div class="alert alert-warning m-b-sm">
    <div class="icon">
        <i class="ri-error-warning-line" />
    </div>
    <div class="content">
        <p>
            请注意，单独使用 OTP 作为认证方式可能比其他方式更不安全，因为生成的验证码通常为 0-9 数字，存在被猜测或枚举的风险（尤其是配置较长有效期时）。
        </p>
        <p>
            对于安全性要求较高的应用，建议将 OTP 与其他认证方式及 <a href="#multi-factor-authentication">多因素认证</a> 选项结合使用。
        </p>
    </div>
</div>
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        // send OTP email to the provided auth record
        const result = await pb.collection('users').requestOTP('test@example.com');

        // ... show a screen/popup to enter the password from the email ...

        // authenticate with the requested OTP id and the email password
        const authData = await pb.collection('users').authWithOTP(result.otpId, "YOUR_OTP");

        // after the above you can also access the auth data from the authStore
        console.log(pb.authStore.isValid);
        console.log(pb.authStore.token);
        console.log(pb.authStore.record.id);

        // "logout"
        pb.authStore.clear();
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        // send OTP email to the provided auth record
        final result = await pb.collection('users').requestOTP('test@example.com');

        // ... show a screen/popup to enter the password from the email ...

        // authenticate with the requested OTP id and the email password
        final authData = await pb.collection('users').authWithOTP(result.otpId, "YOUR_OTP");

        // after the above you can also access the auth data from the authStore
        print(pb.authStore.isValid);
        print(pb.authStore.token);
        print(pb.authStore.record.id);

        // "logout"
        pb.authStore.clear();
    `}
/>

<HeadingLink title="OAuth2 认证" />
<p>
    你也可以通过 OAuth2 提供商（如 Google、GitHub、Microsoft 等）认证用户。具体集成示例见下方。
</p>
<OAuth2 />

<HeadingLink title="多因素认证" />
<div class="content m-b-xs">
    <p>PocketBase v0.23+ 引入了可选的多因素认证（MFA）。</p>
    <p>
        启用后，用户需通过上述任意两种不同认证方式进行认证（顺序不限）。
        <br />
        典型流程如下：
    </p>
    <ol>
        <li>用户通过“认证方式 A”认证。</li>
        <li>
            成功后，返回 401 响应，JSON 体为 <code>{`{"mfaId": "..."}`}</code>（MFA“会话”存储在 <code>_mfas</code> 系统集合中）。
        </li>
        <li>
            用户按常规方式通过“认证方式 B”认证，
            <strong>但需在请求体或查询参数中添加上一步的 <code>mfaId</code></strong
            >。
        </li>
        <li>成功后，返回常规认证响应，即 token + 认证记录数据。</li>
    </ol>
    <p>以下为邮箱/密码 + OTP 认证示例：</p>
</div>
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        try {
          await pb.collection('users').authWithPassword('test@example.com', '1234567890');
        } catch (err) {
          const mfaId = err.response?.mfaId;
          if (!mfaId) {
            throw err; // not mfa -> rethrow
          }

          // the user needs to authenticate again with another auth method, for example OTP
          const result = await pb.collection('users').requestOTP('test@example.com');
          // ... show a modal for users to check their email and to enter the received code ...
          await pb.collection('users').authWithOTP(result.otpId, 'EMAIL_CODE', { 'mfaId': mfaId });
        }
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        try {
          await pb.collection('users').authWithPassword('test@example.com', '1234567890');
        } on ClientException catch (e) {
          final mfaId = e.response['mfaId'];
          if (mfaId == null) {
            throw e; // not mfa -> rethrow
          }

          // the user needs to authenticate again with another auth method, for example OTP
          final result = await pb.collection('users').requestOTP('test@example.com');
          // ... show a modal for users to check their email and to enter the received code ...
          await pb.collection('users').authWithOTP(result.otpId, 'EMAIL_CODE', query: { 'mfaId': mfaId });
        }
    `}
/>

<HeadingLink title="用户模拟登录" />
<div class="content m-b-xs">
    <p>
        超级用户可以通过
        <a href="/docs/api-records#impersonate">模拟登录接口</a>
        生成 token 并以任意用户身份认证。
    </p>
    <p>生成的模拟登录 token 可自定义有效期，但不可刷新！</p>
    <p>
        为方便起见，官方 SDK 会创建并返回一个独立客户端，该实例仅在内存中保存 token 状态，即只在模拟登录客户端实例存活期间有效。
    </p>
</div>
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        // authenticate as superuser
        await pb.collection("_superusers").authWithPassword("test@example.com", "1234567890");

        // impersonate
        // (the custom token duration is in seconds and it is optional)
        const impersonateClient = await pb.collection("users").impersonate("USER_RECORD_ID", 3600)

        // log the impersonate token and user data
        console.log(impersonateClient.authStore.token);
        console.log(impersonateClient.authStore.record);

        // send requests as the impersonated user
        const items = await impersonateClient.collection("example").getFullList();
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        // authenticate as superuser
        await pb.collection("_superusers").authWithPassword("test@example.com", "1234567890");

        // impersonate
        // (the custom token duration is in seconds and it is optional)
        final impersonateClient = await pb.collection("users").impersonate("USER_RECORD_ID", 3600)

        // log the impersonate token and user data
        print(impersonateClient.authStore.token);
        print(impersonateClient.authStore.record);

        // send requests as the impersonated user
        final items = await impersonateClient.collection("example").getFullList();
    `}
/>

<HeadingLink title="API 密钥" />
<div class="content m-b-xs">
    <p>
        虽然 PocketBase 没有传统意义上的“API 密钥”，但由于支持用户模拟登录，对于此类场景你可以使用生成的不可刷新的
        <code>_superusers</code> 模拟登录 token。
        <br />
        你可以通过上述模拟登录 API 或在
        <em>Dashboard &gt; Collections &gt; _superusers &gt; {`{select superuser}`} &gt; “Impersonate” 下拉选项</em
        >生成该 token：
    </p>
</div>
<img
    src="/images/screenshots/impersonate.png"
    alt="_superusers 模拟登录弹窗截图"
    class="screenshot"
/>
<div class="alert alert-danger m-t-xs m-b-xs">
    <div class="icon">
        <i class="ri-alert-line"></i>
    </div>
    <div class="content">
        <p>
            由于安全风险（超级用户可执行、访问和修改所有内容），请极其谨慎地使用生成的 <code>_superusers</code> token，仅用于内部
            <strong>服务器间</strong> 通信。
        </p>
        <p>
            若需使已发放的 token 失效，请更改对应超级用户账号密码
            （如需重置所有超级用户的 token，可在 <code>_superusers</code> 集合选项中更改共享认证 token 密钥）。
        </p>
    </div>
</div>

<HeadingLink title="认证 token 校验" />
<p>
    PocketBase 没有专门的 token 校验接口，但如果你想在第三方应用中校验现有认证 token，可以发送
    <a href="/docs/api-records/#auth-refresh">Auth refresh</a>
    请求，即 <code>pb.collection("users").authRefresh()</code>。
</p>
<p>token 有效时会返回带有刷新 <code>exp</code> 字段和最新用户数据的新 token。</p>
<p>否则会返回错误响应。</p>
<p>
    注意，调用 <code>authRefresh</code> 不会使之前发放的 token 失效，如果不需要可以安全地忽略新 token（如前所述，PocketBase 不会在服务器端存储 token）。
</p>
<p>
    性能方面，生成 JWT 所用的 <code>HS256</code> 算法几乎不会带来额外开销，响应时间基本与调用
    <code>getOne("USER_ID")</code>
    <em>
        （详见
        <a
            href="https://github.com/pocketbase/benchmarks/blob/master/results/hetzner_cax11.md#user-auth-refresh"
            target="_blank"
            rel="noopener noreferrer"
        >
            性能测试
        </a>）
    </em>
    相同。
</p>
