<script>
    import HeadingLink from "@/components/HeadingLink.svelte";
    import ThumbFormats from "@/components/ThumbFormats.svelte";
    import CodeTabs from "@/components/CodeTabs.svelte";
    import Toc from "@/components/Toc.svelte";
</script>

<Toc />

<HeadingLink title="文件上传" />
<p>
    要上传文件，你需要先在集合中添加一个 <code>file</code> 字段：
</p>
<img src="/images/screenshots/file-field.png" alt="文件字段截图" width="465" class="screenshot" />
<p>
    添加后，你可以通过发送 <code>multipart/form-data</code> 请求，使用<em>记录创建/更新 API</em>来创建/更新记录并上传 "documents" 文件。
</p>

<div class="alert alert-info m-t-xs m-b-xs">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            每个上传的文件都会以原始文件名（已清理）存储，并追加一个随机字符串（通常为 10 个字符）。例如 <code>test_52iwbgds7l.png</code>。
        </p>
        <p>
            单个文件的最大允许大小目前约为 8GB（<small>2<sup>53</sup>-1 字节</small>）。
        </p>
    </div>
</div>

<p>
    以下是如何使用 SDK 创建新记录并向示例 "documents" <code>file</code> 字段上传多个文件的示例：
</p>
<!-- prettier-ignore -->
<CodeTabs
    class="m-b-xs"
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        // create a new record and upload multiple files
        // (files must be Blob or File instances)
        const createdRecord = await pb.collection('example').create({
            title: 'Hello world!', // regular text field
            'documents': [
                new File(['content 1...'], 'file1.txt'),
                new File(['content 2...'], 'file2.txt'),
            ]
        });

        // -----------------------------------------------------------
        // Alternative FormData + plain HTML file input example
        // <input type="file" id="fileInput" />
        // -----------------------------------------------------------

        const fileInput = document.getElementById('fileInput');

        const formData = new FormData();

        // set regular text field
        formData.append('title', 'Hello world!');

        // listen to file input changes and add the selected files to the form data
        fileInput.addEventListener('change', function () {
            for (let file of fileInput.files) {
                formData.append('documents', file);
            }
        });

        ...

        // upload and create new record
        const createdRecord = await pb.collection('example').create(formData);
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';
        import 'package:http/http.dart' as http;

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        // create a new record and upload multiple files
        final record = await pb.collection('example').create(
            body: {
                'title': 'Hello world!', // regular text field
            },
            files: [
                http.MultipartFile.fromString(
                    'documents',
                    'example content 1...',
                    filename: 'file1.txt',
                ),
                http.MultipartFile.fromString(
                    'documents',
                    'example content 2...',
                    filename: 'file2.txt',
                ),
            ],
        );
    `}
/>

<p>
    如果你的 <code>file</code> 字段支持上传多个文件（即 <strong>最大文件数选项 &gt;= 2</strong>），你可以使用 <code>+</code> 前缀/后缀字段名修饰符，分别在已上传文件前/后追加新文件。例如：
</p>
<!-- prettier-ignore -->
<CodeTabs
    class="m-b-xs"
    js={`

        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        const createdRecord = await pb.collection('example').update('RECORD_ID', {
            "documents+": new File(["content 3..."], "file3.txt")
        });
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';
        import 'package:http/http.dart' as http;

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        final record = await pb.collection('example').update(
            'RECORD_ID',
            files: [
                http.MultipartFile.fromString(
                    'documents+',
                    'example content 3...',
                    filename: 'file3.txt',
                ),
            ],
        );
    `}
/>

<HeadingLink title="文件删除" />
<p>
    要删除已上传的文件，可以在管理后台编辑记录，或通过 API 将文件字段设置为零值 <br />（空字符串，<code>[]</code>）。
</p>
<p>
    如果你想<strong>从多文件上传字段中删除单个文件</strong>，可以在字段名后加 <code>-</code> 并指定要删除的文件名。以下是使用 SDK 的示例：
</p>
<!-- prettier-ignore -->
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        // delete all "documents" files
        await pb.collection('example').update('RECORD_ID', {
            'documents': [],
        });

        // delete individual files
        await pb.collection('example').update('RECORD_ID', {
            'documents-': ["file1.pdf", "file2.txt"],
        });
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        // delete all "documents" files
        await pb.collection('example').update('RECORD_ID', body: {
            'documents': [],
        });

        // delete individual files
        await pb.collection('example').update('RECORD_ID', body: {
            'documents-': ["file1.pdf", "file2.txt"],
        });
    `}
/>

<p>
    上述示例使用 JSON 对象数据格式，你也可以在 <em>multipart/form-data</em> 请求中使用 <code>FormData</code> 实例。如果使用
    <code>FormData</code>，将文件字段设为空字符串即可。
</p>

<HeadingLink title="文件 URL" />
<p>
    每个上传的文件都可以通过请求其文件 url 进行访问：
    <br />
    <!-- prettier-ignore -->
    <code class="txt-bold">
        http://127.0.0.1:8090/api/files/<span class="txt-danger">COLLECTION_ID_OR_NAME</span>/<span class="txt-info">RECORD_ID</span>/<span class="txt-success">FILENAME</span>
    </code>
</p>
<p>
    如果你的文件字段启用了 <strong>缩略图尺寸</strong> 选项，可以通过在 url 后添加 <code>thumb</code>
    查询参数获取图片文件的缩略图，例如：
    <!-- prettier-ignore -->
    <code>
        http://127.0.0.1:8090/api/files/<span class="txt-danger">COLLECTION_ID_OR_NAME</span>/<span class="txt-info">RECORD_ID</span>/<span class="txt-success">FILENAME</span><strong>?thumb=100x300</strong>
    </code>
    <br />
    <em>目前仅支持 jpg、png、gif（首帧）和部分 webp（以 png 存储）。</em>
</p>

<ThumbFormats />
<p class="txt-hint">
    如果未找到请求的缩略图尺寸或文件不是图片，将返回原始文件！
</p>

<p>
    如果你已有 Record 模型实例，SDK 提供了便捷方法可通过文件名生成文件 url。
</p>

<!-- prettier-ignore -->
<CodeTabs
    class="m-t-10 m-b-xs"
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        const record = await pb.collection('example').getOne('RECORD_ID');

        // get only the first filename from "documents"
        //
        // note:
        // "documents" is an array of filenames because
        // the "documents" field was created with "Max Files" option > 1;
        // if "Max Files" was 1, then the result property would be just a string
        const firstFilename = record.documents[0];

        // returns something like:
        // http://127.0.0.1:8090/api/files/example/kfzjt5oy8r34hvn/test_52iWbGinWd.png?thumb=100x250
        const url = pb.files.getURL(record, firstFilename, {'thumb': '100x250'});
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        final record = await pb.collection('example').getOne('RECORD_ID');

        // get only the first filename from "documents"
        //
        // note:
        // "documents" is an array of filenames because
        // the "documents" field was created with "Max Files" option > 1;
        // if "Max Files" was 1, then the result property would be just a string
        final firstFilename = record.getListValue<String>('documents')[0];

        // returns something like:
        // http://127.0.0.1:8090/api/files/example/kfzjt5oy8r34hvn/test_52iWbGinWd.png?thumb=100x250
        final url = pb.files.getURL(record, firstFilename, thumb: '100x250');
    `}
/>
<p>
    此外，如果希望浏览器在直接访问文件时始终下载而不是预览，可以在文件 url 后添加 <code>?download=1</code> 查询参数。
</p>

<HeadingLink title="受保护文件" />
<p>默认情况下，只要知道完整 url，所有文件都是公开可访问的。</p>
<p>
    对于大多数应用来说，这样已经足够安全，因为所有文件名都带有随机字符串。但在某些情况下，你可能希望为身份证、护照复印件、合同等敏感文件增加额外的安全性，防止未授权访问。
</p>
<p>
    你可以在管理后台的字段选项中将 <code>file</code> 字段标记为<em>受保护</em>，然后通过特殊的<strong>短效文件 token</strong>请求文件。
</p>
<div class="alert alert-info m-t-xs m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            只有满足记录集合<strong>View API 规则</strong>的请求才能访问或下载受保护文件。
        </p>
    </div>
</div>
<!-- prettier-ignore -->
<CodeTabs
    js={`
        import PocketBase from 'pocketbase';

        const pb = new PocketBase('http://127.0.0.1:8090');

        ...

        // authenticate
        await pb.collection('users').authWithPassword('test@example.com', '1234567890');

        // generate a file token
        const fileToken = await pb.files.getToken();

        // retrieve an example protected file url (will be valid ~2min)
        const record = await pb.collection('example').getOne('RECORD_ID');
        const url = pb.files.getURL(record, record.myPrivateFile, {'token': fileToken});
    `}
    dart={`
        import 'package:pocketbase/pocketbase.dart';

        final pb = PocketBase('http://127.0.0.1:8090');

        ...

        // authenticate
        await pb.collection('users').authWithPassword('test@example.com', '1234567890');

        // generate a file token
        final fileToken = await pb.files.getToken();

        // retrieve an example protected file url (will be valid ~2min)
        final record = await pb.collection('example').getOne('RECORD_ID');
        final url = pb.files.getURL(record, record.getStringValue('myPrivateFile'), token: fileToken);
    `}
/>

<HeadingLink title="存储选项" />
<p>
    默认情况下，PocketBase 会将上传的文件存储在本地文件系统的 <code>pb_data/storage</code> 目录下。对于大多数场景，这通常是推荐的存储方式，因为速度快、易于管理和备份。
</p>
<p>
    如果你的磁盘空间有限，可以切换到外部 S3 兼容存储（如 AWS S3、MinIO、Wasabi、DigitalOcean Spaces、Vultr 对象存储等）。最简单的连接设置方式是在 <em>Dashboard</em> &gt; <em>Settings</em> &gt; <em>Files storage</em> 中配置：
</p>
<img src="/images/screenshots/files-storage.png" alt="文件存储设置截图" class="screenshot" />
