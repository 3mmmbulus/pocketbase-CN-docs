<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
</script>

<p>
    默认情况下，PocketBase 只会为 Record 的创建、更新、删除操作（<em>以及 OAuth2 授权重定向</em>）发送实时事件，但你也可以通过
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.SubscriptionsBroker"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.SubscriptionsBroker()</code>
    </a>
    实例向已连接的客户端发送自定义实时消息。
</p>
<p>
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/subscriptions#Broker.Clients"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.SubscriptionsBroker().Clients()</code>
    </a>
    会返回所有已连接的
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/subscriptions#Client"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>subscriptions.Client</code>
    </a>
    ，以唯一连接 id 进行索引。
</p>
<p>
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/subscriptions#Broker.ChunkedClients"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.SubscriptionsBroker().ChunkedClients(size)</code>
    </a>
    类似，但会以分块切片的形式返回结果，便于你在多个 goroutine 中分批处理
    （通常结合
    <a href="https://pkg.go.dev/golang.org/x/sync/errgroup" target="_blank" rel="noopener noreferrer">
        <code>errgroup</code>
    </a>
    使用）。
</p>
<p>
    可以通过 <code>client.Get(apis.RealtimeClientAuthKey)</code> 获取与客户端关联的当前认证记录。
</p>
<div class="alert alert-info m-t-xs m-b-xs">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            注意：单个已认证用户可能拥有多个活跃的实时连接（即多个客户端）。例如在不同标签页、浏览器、设备等同时打开同一个应用时会出现这种情况。
        </p>
    </div>
</div>
<p>
    下方是一个最简代码示例，演示如何向订阅了 "example" 主题的所有客户端发送 JSON 数据包：
</p>
<CodeBlock
    language="go"
    content={`
        func notify(app core.App, subscription string, data any) error {
            rawData, err := json.Marshal(data)
            if err != nil {
                return err
            }

            message := subscriptions.Message{
                Name: subscription,
                Data: rawData,
            }

            group := new(errgroup.Group)

            chunks := app.SubscriptionsBroker().ChunkedClients(300)

            for _, chunk := range chunks {
                group.Go(func() error {
                    for _, client := range chunk {
                        if (!client.HasSubscription(subscription)) {
                            continue
                        }

                        client.Send(message)
                    }

                    return nil
                })
            }

            return group.Wait()
        }

        err := notify(app, "example", map[string]any{"test": 123})
        if err != nil {
            return err
        }
    `}
/>

<p>在客户端，用户可以通过如下方式监听自定义订阅主题：</p>
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        await pb.realtime.subscribe('example', (e) => {
            console.log(e)
        })
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        await pb.realtime.subscribe('example', (e) {
            print(e)
        })
    `}
/>
