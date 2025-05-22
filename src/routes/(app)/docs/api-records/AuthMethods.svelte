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
                  "password": {
                    "enabled": true,
                    "identityFields": ["email"]
                  },
                  "oauth2": {
                    "enabled": true,
                    "providers": [
                      {
                        "name": "github",
                        "displayName": "GitHub",
                        "state": "nT7SLxzXKAVMeRQJtxSYj9kvnJAvGk",
                        "authURL": "https://github.com/login/oauth/authorize?client_id=test&code_challenge=fcf8WAhNI6uCLJYgJubLyWXHvfs8xghoLe3zksBvxjE&code_challenge_method=S256&response_type=code&scope=read%3Auser+user%3Aemail&state=nT7SLxzXKAVMeRQJtxSYj9kvnJAvGk&redirect_uri=",
                        "codeVerifier": "PwBG5OKR2IyQ7siLrrcgWHFwLLLAeUrz7PS1nY4AneG",
                        "codeChallenge": "fcf8WAhNI6uCLJYgJubLyWXHvfs8xghoLe3zksBvxjE",
                        "codeChallengeMethod": "S256"
                      }
                    ]
                  },
                  "mfa": {
                    "enabled": false,
                    "duration": 0
                  },
                  "otp": {
                    "enabled": false,
                    "duration": 0
                  }
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="列出认证方式">
    <div class="content m-b-sm">
        <p>返回允许的集合认证方式的公开列表。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            const result = await pb.collection('users').listAuthMethods();
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            final result = await pb.collection('users').listAuthMethods();
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <div class="content">/api/collections/<code>collectionIdOrName</code>/auth-methods</div>
    </div>

    <div class="section-title">路径参数</div>
    <table class="table-compact table-border m-b-base">
        <thead>
            <tr>
                <th>参数</th>
                <th>类型</th>
                <th width="50%">说明</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>collectionIdOrName</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>认证集合的 ID 或名称。</td>
            </tr>
        </tbody>
    </table>

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
