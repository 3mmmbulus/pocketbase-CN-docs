<script>
    import CodeBlock from "@/components/CodeBlock.svelte";
</script>

<tr>
    <td>expand</td>
    <td>
        <span class="label">字符串</span>
    </td>
    <td>
        自动展开记录关联。例如：
        <CodeBlock content={`?expand=relField1,relField2.subRelField`} />
        支持最多 6 层嵌套关联展开。<br />
        展开的关联内容将附加到记录的
        <code>expand</code> 属性下（例如 
        <code>{`"expand": {"relField1": {...}, ...}`}</code>）。
        <br />
        只有请求用户有<strong>查看</strong>权限的关联才会被展开。
    </td>
</tr>
