<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import PasswordResetRequestApi from "./PasswordResetRequestApi.svelte";
    import PasswordResetConfirmApi from "./PasswordResetConfirmApi.svelte";

    const apiTabs = [
        { title: "请求重置密码", component: PasswordResetRequestApi },
        { title: "确认重置密码", component: PasswordResetConfirmApi },
    ];

    let activeApiTab = 0;
</script>

<Accordion single title="重置密码">
    <div class="content m-b-sm">
        <p>发送认证记录密码重置邮件请求。</p>
        <p>
            密码重置成功后，该记录之前签发的所有认证令牌将会自动失效。
        </p>
    </div>
    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection('users').requestPasswordReset('test@example.com');

            // ---
            // （可选）在你的自定义确认页面中：
            // ---

            // 注意：此调用后之前签发的所有认证令牌都会失效
            await pb.collection('users').confirmPasswordReset(
                'RESET_TOKEN',
                'NEW_PASSWORD',
                'NEW_PASSWORD_CONFIRM',
            );
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection('users').requestPasswordReset('test@example.com');

            // ---
            // （可选）在你的自定义确认页面中：
            // ---

            // 注意：此调用后之前签发的所有认证令牌都会失效
            await pb.collection('users').confirmPasswordReset(
              'RESET_TOKEN',
              'NEW_PASSWORD',
              'NEW_PASSWORD_CONFIRM',
            );
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
