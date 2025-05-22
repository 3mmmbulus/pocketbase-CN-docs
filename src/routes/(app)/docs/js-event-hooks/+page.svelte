<script>
    import Toc from "@/components/Toc.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Accordion from "@/components/Accordion.svelte";
    import HeadingLink from "@/components/HeadingLink.svelte";
    import eventHooks from "../event_hooks.js";

    // apply minor adjustments to the general Go hook description
    // to accommodate some of the changes in the JSVM implementation.
    function adjustForJS(text) {
        return text
            .replaceAll(/\.([A-Z])/gm, (_, p1) => "." + p1.toLowerCase())
            .replaceAll(/On(\w)/gm, "on$1")
            .replaceAll("App.", "$app.");
    }
</script>

<p>
    你可以使用公开的 JavaScript app 事件钩子，通过自定义服务端代码扩展默认的 PocketBase 行为。
</p>
<p>
    在处理函数中抛出错误或未调用 <code>e.next()</code> 会停止钩子执行链。
</p>
<div class="alert alert-info m-t-sm m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            所有钩子处理函数都具有相同的 <code>{`function(e){}`}</code> 签名，并且需要用户调用 <code>e.next()</code> 以继续执行链。
        </p>
    </div>
</div>

<Toc headingSelector="h1, h2, h3, h4, h5" />

{#each eventHooks as group}
    <HeadingLink title={group.title} tag={group.tag || "h3"} />

    {#if group.description}{@html adjustForJS(group.description)}{/if}

    {#if group.hooks}
        <div class="accordions">
            {#each Object.entries(group.hooks) as [hookTitle, hookInfo]}
                {#if hookInfo.js}
                    <Accordion single title={adjustForJS(hookTitle)}>
                        <div class="content m-b-sm">{@html adjustForJS(hookInfo.html)}</div>
                        <CodeBlock language="javascript" content={hookInfo.js} />
                    </Accordion>
                {/if}
            {/each}
        </div>
    {/if}
{/each}
