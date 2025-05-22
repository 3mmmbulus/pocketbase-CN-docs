<script>
    import Download from "./Download.svelte";
    import Token from "./Token.svelte";
</script>

<p>
    文件的上传、更新或删除操作需通过
    <a href="/docs/api-records">Records API</a>
    完成。
</p>

<p>
    File API 通常用于获取/下载文件资源（支持基础的图片处理，如生成缩略图）。
</p>

<div class="clearfix m-t-base" />

<div class="accordions">
    <Download />
    <Token />
</div>
