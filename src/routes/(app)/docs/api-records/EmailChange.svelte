<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import EmailChangeRequestApi from "./EmailChangeRequestApi.svelte";
    import EmailChangeConfirmApi from "./EmailChangeConfirmApi.svelte";

    const apiTabs = [
        { title: "请求邮箱变更", component: EmailChangeRequestApi },
        { title: "确认邮箱变更", component: EmailChangeConfirmApi },
    ];

    let activeApiTab = 0;
</script>

<Accordion single title="邮箱变更">
    <div class="content m-b-sm">
        <p>发送认证记录邮箱变更请求。</p>
        <p>
            邮箱变更成功后，该记录之前签发的所有认证令牌将会自动失效。
        </p>
    </div>
    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection('users').authWithPassword('test@example.com', '1234567890');

            await pb.collection('users').requestEmailChange('new@example.com');

            // ---
            // （可选）在你的自定义确认页面中：
            // ---

            // 注意：此调用后之前签发的所有认证令牌都会失效
            await pb.collection('users').confirmEmailChange('EMAIL_CHANGE_TOKEN', 'YOUR_PASSWORD');
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection('users').authWithPassword('test@example.com', '1234567890');

            await pb.collection('users').requestEmailChange('new@example.com');

            ...

            // ---
            // （可选）在你的自定义确认页面中：
            // ---

            // 注意：此调用后之前签发的所有认证令牌都会失效
            await pb.collection('users').confirmEmailChange('EMAIL_CHANGE_TOKEN', 'YOUR_PASSWORD');
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
