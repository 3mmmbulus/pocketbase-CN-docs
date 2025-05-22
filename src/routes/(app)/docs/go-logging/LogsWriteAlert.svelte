<div class="alert alert-info m-t-10 m-b-sm">
    <div class="icon">
        <i class="ri-information-line" />
    </div>
    <div class="content">
        <p>
            为了获得更好的性能并减少高频路径上的阻塞，日志会以防抖和批量的方式写入：
        </p>
        <ul>
            <li>最后一次防抖日志写入后 3 秒</li>
            <li>达到批量阈值时（当前为 200）</li>
            <li>应用终止前，尝试保存日志队列中所有剩余日志</li>
        </ul>
    </div>
</div>
