<script>
    import Toc from "@/components/Toc.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Accordion from "@/components/Accordion.svelte";
    import HeadingLink from "@/components/HeadingLink.svelte";
    import eventHooks from "../event_hooks.js";
</script>

<p>
    修改 PocketBase 的标准方式是在你的 Go 代码中使用
    <strong>事件钩子（event hooks）</strong>。
</p>
<p>所有钩子都有 3 个主要方法：</p>
<ul>
    <li class="m-b-xs">
        <a
            href="{import.meta.env.PB_GODOC_URL}/tools/hook#Hook.Bind"
            target="_blank"
            rel="noopener noreferrer"
        >
            <code class="txt-bold">Bind(handler)</code>
        </a>
        向指定的事件钩子添加一个新的处理器。处理器有 3 个字段：
        <ul>
            <li>
                <code>Id</code> <em class="txt-hint">（可选）</em> - 处理器的名称（可作为 <code>Unbind</code> 的参数）
            </li>
            <li>
                <code>Priority</code> <em class="txt-hint">（可选）</em> - 处理器的执行顺序（如果为空，则按代码注册顺序执行）。
            </li>
            <li><code>Func</code> <em>（必填）</em> - 处理器函数。</li>
        </ul>
    </li>
    <li class="m-b-xs">
        <a
            href="{import.meta.env.PB_GODOC_URL}/tools/hook#Hook.BindFunc"
            target="_blank"
            rel="noopener noreferrer"
        >
            <code class="txt-bold">BindFunc(func)</code>
        </a>
        类似于 <code>Bind</code>，但只需提供函数即可注册新的处理器。
        <br />
        注册的处理器默认优先级为 0，id 会自动生成（返回的字符串值）。
    </li>
    <li>
        <a
            href="{import.meta.env.PB_GODOC_URL}/tools/hook#Hook.Trigger"
            target="_blank"
            rel="noopener noreferrer"
        >
            <code class="txt-bold">Trigger(event, oneOffHandlerFuncs...)</code>
        </a>
        触发事件钩子。
        <br />
        <em class="txt-hint">此方法很少需要用户手动调用。</em>
    </li>
</ul>

<p>
    若要移除已注册的钩子处理器，可以使用处理器 id 并传递给
    <code>Unbind(id)</code>，或使用
    <code>UnbindAll()</code>（<em>！包括系统处理器</em>）移除所有处理器。
</p>

<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            所有钩子处理器函数都具有相同的 <code>{`func(e T) error`}</code> 签名，并且需要用户调用 <code>e.Next()</code> 以继续执行链。
        </p>
        <p class="txt-bold">
            如果你需要在钩子处理器内部访问 app 实例，建议使用
            <code>e.App</code> 字段，而不是复用父作用域的 app 变量，因为钩子可能在数据库事务中，会导致死锁。
        </p>
        <p>
            另外，避免在钩子处理器中使用全局互斥锁，因为它可能会被递归调用（如级联删除），从而导致死锁。
        </p>
    </div>
</div>

<p>你可以在下方查看所有可用的钩子：</p>

<Toc headingSelector="h1, h2, h3, h4, h5" />

{#each eventHooks as group}
    <HeadingLink title={group.title} tag={group.tag || "h3"} />

    {#if group.description}{@html group.description}{/if}

    {#if group.hooks}
        <div class="accordions">
            {#each Object.entries(group.hooks) as [hookTitle, hookInfo]}
                {#if hookInfo.go}
                    <Accordion single title={hookTitle}>
                        <div class="content m-b-sm">{@html hookInfo.html}</div>
                        <CodeBlock language="go" class="m-b-0" content={hookInfo.go} />
                    </Accordion>
                {/if}
            {/each}
        </div>
    {/if}
{/each}
