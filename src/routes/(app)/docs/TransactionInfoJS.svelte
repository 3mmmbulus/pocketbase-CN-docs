<p>
    要在一个事务中执行多个查询，可以使用
    <a href="/jsvm/functions/_app.runInTransaction.html" target="_blank" rel="noopener noreferrer">
        <code>$app.runInTransaction(fn)</code>
    </a>
    。
</p>
<p>只有当事务未抛出错误并顺利完成时，数据库操作才会被持久化。</p>
<p>
    只要使用回调的 <code>txApp</code> 参数，嵌套 <code>runInTransaction</code> 调用是安全的。
</p>
<div class="alert alert-info m-b-xs">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            在事务函数内部，请始终使用其 <code>txApp</code> 参数，而不是原始的 <code>$app</code> 实例，因为我们只允许同时有一个写入者/事务，否则可能导致死锁。
        </p>
        <p>
            为避免性能问题，请尽量减少在事务中执行如发送邮件、连接外部服务等耗时或长时间运行的任务。
        </p>
    </div>
</div>
