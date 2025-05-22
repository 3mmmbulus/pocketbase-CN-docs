<script>
    import Accordion from "@/components/Accordion.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import FilterSyntax from "@/components/FilterSyntax.svelte";
    import FieldsQueryParam from "@/components/FieldsQueryParam.svelte";
    import SkipTotalQueryParam from "@/components/SkipTotalQueryParam.svelte";

    const responses = [
        {
            code: 200,
            body: `
                {
                  "page": 1,
                  "perPage": 2,
                  "totalItems": 10,
                  "totalPages": 5,
                  "items": [
                    {
                      "id": "_pbc_344172009",
                      "listRule": null,
                      "viewRule": null,
                      "createRule": null,
                      "updateRule": null,
                      "deleteRule": null,
                      "name": "users",
                      "type": "auth",
                      "fields": [
                        {
                          "autogeneratePattern": "[a-z0-9]{15}",
                          "hidden": false,
                          "id": "text3208210256",
                          "max": 15,
                          "min": 15,
                          "name": "id",
                          "pattern": "^[a-z0-9]+$",
                          "presentable": false,
                          "primaryKey": true,
                          "required": true,
                          "system": true,
                          "type": "text"
                        },
                        {
                          "cost": 0,
                          "hidden": true,
                          "id": "password901924565",
                          "max": 0,
                          "min": 8,
                          "name": "password",
                          "pattern": "",
                          "presentable": false,
                          "required": true,
                          "system": true,
                          "type": "password"
                        },
                        {
                          "autogeneratePattern": "[a-zA-Z0-9]{50}",
                          "hidden": true,
                          "id": "text2504183744",
                          "max": 60,
                          "min": 30,
                          "name": "tokenKey",
                          "pattern": "",
                          "presentable": false,
                          "primaryKey": false,
                          "required": true,
                          "system": true,
                          "type": "text"
                        },
                        {
                          "exceptDomains": null,
                          "hidden": false,
                          "id": "email3885137012",
                          "name": "email",
                          "onlyDomains": null,
                          "presentable": false,
                          "required": true,
                          "system": true,
                          "type": "email"
                        },
                        {
                          "hidden": false,
                          "id": "bool1547992806",
                          "name": "emailVisibility",
                          "presentable": false,
                          "required": false,
                          "system": true,
                          "type": "bool"
                        },
                        {
                          "hidden": false,
                          "id": "bool256245529",
                          "name": "verified",
                          "presentable": false,
                          "required": false,
                          "system": true,
                          "type": "bool"
                        },
                        {
                          "autogeneratePattern": "",
                          "hidden": false,
                          "id": "text1579384326",
                          "max": 255,
                          "min": 0,
                          "name": "name",
                          "pattern": "",
                          "presentable": false,
                          "primaryKey": false,
                          "required": false,
                          "system": false,
                          "type": "text"
                        },
                        {
                          "hidden": false,
                          "id": "file376926767",
                          "maxSelect": 1,
                          "maxSize": 0,
                          "mimeTypes": [
                            "image/jpeg",
                            "image/png",
                            "image/svg+xml",
                            "image/gif",
                            "image/webp"
                          ],
                          "name": "avatar",
                          "presentable": false,
                          "protected": false,
                          "required": false,
                          "system": false,
                          "thumbs": null,
                          "type": "file"
                        },
                        {
                          "hidden": false,
                          "id": "autodate2990389176",
                          "name": "created",
                          "onCreate": true,
                          "onUpdate": false,
                          "presentable": false,
                          "system": false,
                          "type": "autodate"
                        },
                        {
                          "hidden": false,
                          "id": "autodate3332085495",
                          "name": "updated",
                          "onCreate": true,
                          "onUpdate": true,
                          "presentable": false,
                          "system": false,
                          "type": "autodate"
                        }
                      ],
                      "indexes": [
                        "CREATE UNIQUE INDEX \`idx_tokenKey__pbc_344172009\` ON \`users\` (\`tokenKey\`)",
                        "CREATE UNIQUE INDEX \`idx_email__pbc_344172009\` ON \`users\` (\`email\`) WHERE \`email\` != ''"
                      ],
                      "system": false,
                      "authRule": "",
                      "manageRule": null,
                      "authAlert": {
                        "enabled": true,
                        "emailTemplate": {
                          "subject": "Login from a new location",
                          "body": "..."
                        }
                      },
                      "oauth2": {
                        "enabled": false,
                        "mappedFields": {
                          "id": "",
                          "name": "name",
                          "username": "",
                          "avatarURL": "avatar"
                        },
                        "providers": [
                            {
                                "pkce": null,
                                "name": "google",
                                "clientId": "abc",
                                "authURL": "",
                                "tokenURL": "",
                                "userInfoURL": "",
                                "displayName": "",
                                "extra": null
                            }
                        ]
                      },
                      "passwordAuth": {
                        "enabled": true,
                        "identityFields": [
                          "email"
                        ]
                      },
                      "mfa": {
                        "enabled": false,
                        "duration": 1800,
                        "rule": ""
                      },
                      "otp": {
                        "enabled": false,
                        "duration": 180,
                        "length": 8,
                        "emailTemplate": {
                          "subject": "OTP for {APP_NAME}",
                          "body": "..."
                        }
                      },
                      "authToken": {
                        "duration": 604800
                      },
                      "passwordResetToken": {
                        "duration": 1800
                      },
                      "emailChangeToken": {
                        "duration": 1800
                      },
                      "verificationToken": {
                        "duration": 259200
                      },
                      "fileToken": {
                        "duration": 180
                      },
                      "verificationTemplate": {
                        "subject": "Verify your {APP_NAME} email",
                        "body": "..."
                      },
                      "resetPasswordTemplate": {
                        "subject": "Reset your {APP_NAME} password",
                        "body": "..."
                      },
                      "confirmEmailChangeTemplate": {
                        "subject": "Confirm your {APP_NAME} new email address",
                        "body": "..."
                      }
                    },
                    {
                      "id": "_pbc_2287844090",
                      "listRule": null,
                      "viewRule": null,
                      "createRule": null,
                      "updateRule": null,
                      "deleteRule": null,
                      "name": "posts",
                      "type": "base",
                      "fields": [
                        {
                          "autogeneratePattern": "[a-z0-9]{15}",
                          "hidden": false,
                          "id": "text3208210256",
                          "max": 15,
                          "min": 15,
                          "name": "id",
                          "pattern": "^[a-z0-9]+$",
                          "presentable": false,
                          "primaryKey": true,
                          "required": true,
                          "system": true,
                          "type": "text"
                        },
                        {
                          "autogeneratePattern": "",
                          "hidden": false,
                          "id": "text724990059",
                          "max": 0,
                          "min": 0,
                          "name": "title",
                          "pattern": "",
                          "presentable": false,
                          "primaryKey": false,
                          "required": false,
                          "system": false,
                          "type": "text"
                        },
                        {
                          "hidden": false,
                          "id": "autodate2990389176",
                          "name": "created",
                          "onCreate": true,
                          "onUpdate": false,
                          "presentable": false,
                          "system": false,
                          "type": "autodate"
                        },
                        {
                          "hidden": false,
                          "id": "autodate3332085495",
                          "name": "updated",
                          "onCreate": true,
                          "onUpdate": true,
                          "presentable": false,
                          "system": false,
                          "type": "autodate"
                        }
                      ],
                      "indexes": [],
                      "system": false
                    }
                  ]
                }
            `,
        },
        {
            code: 400,
            body: `
                {
                  "status": 400,
                  "message": "Something went wrong while processing your request. Invalid filter.",
                  "data": {}
                }
            `,
        },
        {
            code: 401,
            body: `
                {
                  "status": 401,
                  "message": "The request requires valid record authorization token.",
                  "data": {}
                }
            `,
        },
        {
            code: 403,
            body: `
                {
                  "status": 403,
                  "message": "Only superusers can perform this action.",
                  "data": {}
                }
            `,
        },
    ];

    let responseTab = responses[0].code;
</script>

<Accordion single title="集合列表">
    <div class="content m-b-sm">
        <p>返回分页的集合列表。</p>
        <p>仅超级用户可执行此操作。</p>
    </div>

    <CodeTabs
        js={`
            import PocketBase from 'pocketbase';

            const pb = new PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            // fetch a paginated collections list
            const pageResult = await pb.collections.getList(1, 100, {
                filter: 'created >= "2022-01-01 00:00:00"',
            });

            // you can also fetch all collections at once via getFullList
            const collections = await pb.collections.getFullList({ sort: '-created' });

            // or fetch only the first collection that matches the specified filter
            const collection = await pb.collections.getFirstListItem('type="auth"');
        `}
        dart={`
            import 'package:pocketbase/pocketbase.dart';

            final pb = PocketBase('http://127.0.0.1:8090');

            ...

            await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');

            // fetch a paginated collections list
            final pageResult = await pb.collections.getList(
                page: 1,
                perPage: 100,
                filter: 'created >= "2022-01-01 00:00:00"',
            );

            // you can also fetch all collections at once via getFullList
            final collections = await pb.collections.getFullList(sort: '-created');

            // or fetch only the first collection that matches the specified filter
            final collection = await pb.collections.getFirstListItem('type="auth"');
        `}
    />

    <h6 class="m-b-xs">API 详情</h6>
    <div class="api-route alert alert-info">
        <strong class="label label-primary">GET</strong>
        <div class="content">/api/collections</div>
        <small class="txt-hint auth-header">需要 <code>Authorization:TOKEN</code></small>
    </div>

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
            <tr>
                <td id="query-page">page</td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>分页列表的页码（默认值为 1）。</td>
            </tr>
            <tr>
                <td id="query-perPage">perPage</td>
                <td>
                    <span class="label">Number</span>
                </td>
                <td>每页返回的最大集合数（默认值为 30）。</td>
            </tr>
            <tr>
                <td id="query-sort">sort</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    <div class="content">
                        <p>指定 <em>ORDER BY</em> 字段。</p>
                        <p>
                            在属性前加 <code>-</code> / <code>+</code>（默认）表示降序 / 升序，例如：
                        </p>
                        <CodeBlock
                            content={`
                                // 按 created 降序，id 升序
                                ?sort=-created,id
                            `}
                        />
                        <p>
                            <strong>支持的集合排序字段：</strong> <br />
                            <code>@random</code>、<code>id</code>、<code>created</code>、
                            <code>updated</code>、<code>name</code>、<code>type</code>、
                            <code>system</code>
                        </p>
                    </div>
                </td>
            </tr>
            <tr>
                <td id="query-filter">filter</td>
                <td>
                    <span class="label">String</span>
                </td>
                <td>
                    <div class="content">
                        <p>用于筛选/搜索返回集合列表的过滤表达式，例如：</p>
                        <CodeBlock
                            content={`
                                ?filter=(name~'abc' && created>'2022-01-01')
                            `}
                        />
                        <p>
                            <strong>支持的集合过滤字段：</strong> <br />
                            <code>id</code>、<code>created</code>、<code>updated</code>、
                            <code>name</code>、<code>type</code>、<code>system</code>
                        </p>
                        <FilterSyntax />
                    </div>
                </td>
            </tr>
            <FieldsQueryParam />
            <SkipTotalQueryParam />
        </tbody>
    </table>

    <div class="section-title">响应示例</div>
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
