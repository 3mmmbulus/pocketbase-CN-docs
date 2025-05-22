<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import CodeBlock from "@/components/CodeBlock.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<p>PocketBase 提供了本地文件系统与 S3 之间的轻量级抽象。</p>
<p>
    你可以在
    <em>Dashboard > Settings > Files storage</em>
    部分调整存储设置，以配置使用哪种存储方式。
</p>
<p>
    你可以通过
    <a
        href="{import.meta.env.PB_GODOC_URL}/core#BaseApp.NewFilesystem"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>app.NewFilesystem()</code>
    </a>
    方法以编程方式访问文件系统抽象。
</p>
<p>
    下方列出了一些最常用的操作，更多细节请参考
    <a href="{import.meta.env.PB_GODOC_URL}/tools/filesystem" target="_blank" rel="noopener noreferrer">
        <code>filesystem</code>
    </a>
    子包。
</p>

<div class="alert alert-warning">
    <div class="icon">
        <i class="ri-error-warning-line" />
    </div>
    <div class="content">
        <p>
            请务必在结束时调用 <code>Close()</code>，无论是新建的文件系统实例还是获取到的文件读取器，以防止资源泄漏。
        </p>
    </div>
</div>

<Toc />

<HeadingLink title="读取文件" />
<p>
    若要获取单个已存储文件的内容，可以使用
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/filesystem#System.GetReader"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>GetReader(key)</code>
    </a>
    。
    <br />
    注意，文件 key 通常包含<strong>前缀</strong>（即文件的“路径”）。对于记录文件，完整 key 格式为
    <code>collectionId/recordId/filename</code>。
    <br />
    若要获取匹配特定<em>前缀</em>的多个文件，可以使用
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/filesystem#System.List"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>List(prefix)</code>
    </a>
    。
</p>
<p>
    下方代码展示了如何获取单个记录文件并将其内容复制到
    <code>bytes.Buffer</code>
    的最简示例。
</p>
<CodeBlock
    language="go"
    content={`
        record, err := app.FindAuthRecordByEmail("users", "test@example.com")
        if err != nil {
            return err
        }

        // construct the full file key by concatenating the record storage path with the specific filename
        avatarKey := record.BaseFilesPath() + "/" + record.GetString("avatar")

        // initialize the filesystem
        fsys, err := app.NewFilesystem()
        if err != nil {
            return err
        }
        defer fsys.Close()

        // retrieve a file reader for the avatar key
        r, err := fsys.GetReader(avatarKey)
        if err != nil {
            return err
        }
        defer r.Close()

        // do something with the reader...
        content := new(bytes.Buffer)
        _, err = io.Copy(content, r)
        if err != nil {
            return err
        }
    `}
/>

<HeadingLink title="保存文件" />
<p>
    根据可用的文件内容来源，有多种方法可以保存<em>（即写入/上传）</em>文件：
</p>
<ul>
    <li>
        <a
            href="{import.meta.env.PB_GODOC_URL}/tools/filesystem#System.Upload"
            target="_blank"
            rel="noopener noreferrer"
        >
            <code>Upload([]byte, key)</code>
        </a>
    </li>
    <li>
        <a
            href="{import.meta.env.PB_GODOC_URL}/tools/filesystem#System.UploadFile"
            target="_blank"
            rel="noopener noreferrer"
        >
            <code>UploadFile(*filesystem.File, key)</code>
        </a>
    </li>
    <li>
        <a
            href="{import.meta.env.PB_GODOC_URL}/tools/filesystem#System.UploadFile"
            target="_blank"
            rel="noopener noreferrer"
        >
            <code>UploadMultipart(*multipart.FileHeader, key)</code>
        </a>
    </li>
</ul>
<p>
    大多数用户很少需要直接使用上述方法，因为对于集合记录，文件持久化在保存记录模型时会自动处理（同时会根据集合 <code>file</code> 字段选项进行大小和 MIME 类型校验）。例如：
</p>
<CodeBlock
    language="go"
    content={`
        record, err := app.FindRecordById("articles", "RECORD_ID")
        if err != nil {
            return err
        }

        // Other available File factories
        // - filesystem.NewFileFromBytes(data, name)
        // - filesystem.NewFileFromURL(ctx, url)
        // - filesystem.NewFileFromMultipart(mh)
        f, err := filesystem.NewFileFromPath("/local/path/to/file")

        // set new file (can be single *filesytem.File or multiple []*filesystem.File)
        // (if the record has an old file it is automatically deleted on successful Save)
        record.Set("yourFileField", f)

        err = app.Save(record)
        if err != nil {
            return err
        }
    `}
/>

<HeadingLink title="删除文件" />
<p>
    可以使用
    <a
        href="{import.meta.env.PB_GODOC_URL}/tools/filesystem#System.Delete"
        target="_blank"
        rel="noopener noreferrer"
    >
        <code>Delete(key)</code>
    </a>
    从存储文件系统中删除文件。
</p>
<p>
    与前述类似，大多数用户很少需要直接使用 <code>Delete</code> 方法，因为对于集合记录，删除文件时只需从记录模型中移除已有文件名即可（这也会确保数据库中引用该文件的条目被一并移除）。例如：
</p>
<CodeBlock
    language="go"
    content={`
        record, err := app.FindRecordById("articles", "RECORD_ID")
        if err != nil {
            return err
        }

        // if you want to "reset" a file field (aka. deleting the associated single or multiple files)
        // you can set it to nil
        record.Set("yourFileField", nil)

        // OR if you just want to remove individual file(s) from a multiple file field you can use the "-" modifier
        // (the value could be a single filename string or slice of filename strings)
        record.Set("yourFileField-", "example_52iWbGinWd.txt")

        err = app.Save(record)
        if err != nil {
            return err
        }
    `}
/>
