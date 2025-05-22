<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
    import HeadingLink from "@/components/HeadingLink.svelte";
    import Toc from "@/components/Toc.svelte";
    import CommonHelper from "@/utils/CommonHelper";
</script>

<Toc />

<HeadingLink title="app.Store()" />
<p>
    <a href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.Store" target="_blank" rel="noopener noreferrer">
        <code>app.Store()</code>
    </a>
    返回一个并发安全的应用内存存储，你可以用它在应用进程期间存储任意内容（如缓存、配置标志等）。
</p>
<p>
    你可以在
    <a href="{import.meta.env.PB_GODOC_URL}/tools/store#Store" target="_blank" rel="noopener noreferrer">
        <code>store.Store</code>
    </a>
    文档中查看更多可用的存储方法，但最常用的是 <code>Get(key)</code>、<code>Set(key, value)</code> 和
    <code>GetOrSet(key, setFunc)</code>。
</p>
<CodeBlock
    language="go"
    content={`
        app.Store().Set("example", 123)

        v1 := app.Store().Get("example").(int) // 123

        v2 := app.Store().GetOrSet("example2", func() any {
            // this setter is invoked only once unless "example2" is removed
            // (e.g. suitable for instantiating singletons)
            return 456
        }).(int) // 456
    `}
/>

<div class="alert alert-warning">
    <div class="icon">
        <i class="ri-error-warning-line" />
    </div>
    <div class="content">
        <p>
            请注意，应用存储也会被内部使用，通常以 <code>pb*</code> 为前缀的 key（例如集合缓存存储在 <code>pbAppCachedCollections</code> key 下），更改这些系统 key 或调用 <code>RemoveAll()</code>/<code>Reset()</code> 可能会导致意外后果。
        </p>
        <p>
            如果你需要更高级的控制，可以通过 <code>store.New[K, T](nil)</code> 独立于应用实例初始化你自己的存储。
        </p>
    </div>
</div>

<HeadingLink title="安全辅助方法" />
<p>
    <em>
        下方列出了一些最常用的安全辅助方法，所有可用方法的详细文档可在
        <a href="{import.meta.env.PB_GODOC_URL}/tools/security" target="_blank" rel="noopener noreferrer">
            <code>security</code>
        </a>
        子包中找到。
    </em>
</p>

<HeadingLink title="生成随机字符串" tag="h5" />
<CodeBlock
    language="go"
    content={`
        secret := security.RandomString(10) // e.g. a35Vdb10Z4

        secret := security.RandomStringWithAlphabet(5, "1234567890") // e.g. 33215
    `}
/>

<HeadingLink title="常量时间字符串比较" tag="h5" />
<CodeBlock
    language="go"
    content={`
        isEqual := security.Equal(hash1, hash2)
    `}
/>

<HeadingLink title="AES 加密/解密" tag="h5" />
<CodeBlock
    language="go"
    content={`
        // must be random 32 characters string
        const key = "` +
        CommonHelper.randomString(32) +
        `"

        encrypted, err := security.Encrypt([]byte("test"), key)
        if err != nil {
            return err
        }

        decrypted := security.Decrypt(encrypted, key) // []byte("test")
    `}
/>
