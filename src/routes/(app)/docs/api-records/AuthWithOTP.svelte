<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import AuthWithOTPRequestApi from "./AuthWithOTPRequestApi.svelte";
    import AuthWithOTPAuthApi from "./AuthWithOTPAuthApi.svelte";

    const apiTabs = [
        { title: "OTP 请求", component: AuthWithOTPRequestApi },
        { title: "OTP 验证", component: AuthWithOTPAuthApi },
    ];

    let activeApiTab = 0;
</script>

<Accordion single title="OTP 认证">
    <div class="content m-b-sm">
        <p>使用一次性密码（OTP）认证单个认证记录。</p>
        <p>
            注意：当请求 OTP 时，即使提供的邮箱用户不存在，我们也会返回一个 <code>otpId</code>，以实现基础的枚举保护。
        </p>
    </div>
    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            // send OTP email to the provided auth record
            const req = await pb.collection('users').requestOTP('test@example.com');

            // ... show a screen/popup to enter the password from the email ...

            // authenticate with the requested OTP id and the email password
            const authData = await pb.collection('users').authWithOTP(req.otpId, "YOUR_OTP");

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
            final req = await pb.collection('users').requestOTP('test@example.com');

            // ... show a screen/popup to enter the password from the email ...

            // authenticate with the requested OTP id and the email password
            final authData = await pb.collection('users').authWithOTP(req.otpId, "YOUR_OTP");

            // after the above you can also access the auth data from the authStore
            print(pb.authStore.isValid);
            print(pb.authStore.token);
            print(pb.authStore.record.id);

            // "logout"
            pb.authStore.clear();
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="tabs">
        <div class="tabs-header compact">
            {#each apiTabs as tab, i}
                <button class="tab-item" class:active={activeApiTab == i} on:click={() => (activeApiTab = i)}>
                    <div class="txt">{tab.title}</div>
                </button>
            {/each}
        </div>
        <div class="tabs-content">
            {#each apiTabs as tab, i}
                <div class="tab-item" class:active={activeApiTab == i}>
                    <svelte:component this={tab.component} />
                </div>
            {/each}
        </div>
    </div>
</Accordion>
