<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<p>
    PocketBase 提供了多种测试 mock 和 stub（如 <code>tests.TestApp</code>、
    <code>tests.ApiScenario</code>、<code>tests.MockMultipartData</code> 等），帮助你为应用编写单元测试和集成测试。
</p>
<p>
    你可以在
    <a href="{import.meta.env.PB_GODOC_URL}/tests" target="_blank" rel="noreferrer noopener">
        <code>github.com/pocketbase/pocketbase/tests</code>
    </a>
    子包中找到更多信息，下面是一个简单示例。
</p>

<Toc />

<HeadingLink title="1. 初始化" />

<p>
    假设我们有一个自定义 API 路由 <code>GET /my/hello</code>，需要超级用户认证：
</p>
<CodeBlock
    language="go"
    content={`
        // main.go
        package main

        import (
            "log"
            "net/http"

            "github.com/pocketbase/pocketbase"
            "github.com/pocketbase/pocketbase/apis"
            "github.com/pocketbase/pocketbase/core"
        )

        func bindAppHooks(app core.App) {
            app.OnServe().BindFunc(func(se *core.ServeEvent) error {
                se.Router.Get("/my/hello", func(e *core.RequestEvent) error {
                    return e.JSON(http.StatusOK, "Hello world!")
                }).Bind(apis.RequireSuperuserAuth())

                return se.Next()
            })
        }

        func main() {
            app := pocketbase.New()

            bindAppHooks(app)

            if err := app.Start(); err != nil {
                log.Fatal(err)
            }
        }
    `}
/>

<HeadingLink title="2. 准备测试数据" />
<p>
    现在我们需要准备测试/模拟数据。有多种方式可以实现，最简单的方法是用自定义 <code>test_pb_data</code> 目录启动你的应用，例如：
</p>
<CodeBlock content={`./pocketbase serve --dir="./test_pb_data" --automigrate=0`} />
<p>
    打开浏览器，通过仪表盘创建测试数据（包括集合和记录）。完成后可以停止服务器（你也可以将 <code>test_pb_data</code> 提交到你的仓库）。
</p>

<HeadingLink title="3. 集成测试" />

<p>要测试上述接口，我们希望：</p>
<ul>
    <li>确保它只处理 GET 请求</li>
    <li>确保只有超级用户可以访问</li>
    <li>检查响应体是否正确设置</li>
</ul>

<p>
    下面是针对上述测试用例的一个简单集成测试。我们还会用到前面步骤创建的测试数据。
</p>
<!-- prettier-ignore -->
<CodeBlock
    language="go"
    content={`
        // main_test.go
        package main

        import (
            "net/http"
            "testing"

            "github.com/pocketbase/pocketbase/core"
            "github.com/pocketbase/pocketbase/tests"
        )

        const testDataDir = "./test_pb_data"

        func generateToken(collectionNameOrId string, email string) (string, error) {
            app, err := tests.NewTestApp(testDataDir)
            if err != nil {
                return "", err
            }
            defer app.Cleanup()

            record, err := app.FindAuthRecordByEmail(collectionNameOrId, email)
            if err != nil {
                return "", err
            }

            return record.NewAuthToken()
        }

        func TestHelloEndpoint(t *testing.T) {
            recordToken, err := generateToken("users", "test@example.com")
            if err != nil {
                t.Fatal(err)
            }

            superuserToken, err := generateToken(core.CollectionNameSuperusers, "test@example.com")
            if err != nil {
                t.Fatal(err)
            }

            // setup the test ApiScenario app instance
            setupTestApp := func(t testing.TB) *tests.TestApp {
                testApp, err := tests.NewTestApp(testDataDir)
                if err != nil {
                    t.Fatal(err)
                }
                // no need to cleanup since scenario.Test() will do that for us
                // defer testApp.Cleanup()

                bindAppHooks(testApp)

                return testApp
            }

            scenarios := []tests.ApiScenario{
                {
                    Name:            "try with different http method, e.g. POST",
                    Method:          http.MethodPost,
                    URL:             "/my/hello",
                    ExpectedStatus:  405,
                    ExpectedContent: []string{"\\"data\\":{}"},
                    TestAppFactory:  setupTestApp,
                },
                {
                    Name:            "try as guest (aka. no Authorization header)",
                    Method:          http.MethodGet,
                    URL:             "/my/hello",
                    ExpectedStatus:  401,
                    ExpectedContent: []string{"\\"data\\":{}"},
                    TestAppFactory:  setupTestApp,
                },
                {
                    Name:   "try as authenticated app user",
                    Method: http.MethodGet,
                    URL:    "/my/hello",
                    Headers: map[string]string{
                        "Authorization": recordToken,
                    },
                    ExpectedStatus:  401,
                    ExpectedContent: []string{"\\"data\\":{}"},
                    TestAppFactory:  setupTestApp,
                },
                {
                    Name:   "try as authenticated superuser",
                    Method: http.MethodGet,
                    URL:    "/my/hello",
                    Headers: map[string]string{
                        "Authorization": superuserToken,
                    },
                    ExpectedStatus:  200,
                    ExpectedContent: []string{"Hello world!"},
                    TestAppFactory:  setupTestApp,
                },
            }

            for _, scenario := range scenarios {
                scenario.Test(t)
            }
        }
    `}
/>