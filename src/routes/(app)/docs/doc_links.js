export const introductionLinks = [
    {
        href: "/docs",
        title: "简介",
        icon: "ri-home-2-line",
        children: [
            {
                href: "/docs/how-to-use",
                title: "如何使用 PocketBase",
            },
            {
                href: "/docs/collections",
                title: "集合",
            },
            {
                href: "/docs/api-rules-and-filters",
                title: "API 规则与过滤器",
            },
            {
                href: "/docs/authentication",
                title: "认证",
            },
            {
                href: "/docs/files-handling",
                title: "文件上传与处理",
            },
            {
                href: "/docs/working-with-relations",
                title: "关系操作",
            },
            {
                href: "/docs/use-as-framework",
                title: "扩展 PocketBase",
            },
        ]
    },
]

export const webApiLinks = [
    {
        title: "Web API 参考",
        href: "/docs/api-records",
        icon: "ri-file-list-2-line",
        children: [
            {
                href: "/docs/api-records",
                title: "API Records",
            },
            {
                href: "/docs/api-realtime",
                title: "API 实时",
            },
            {
                href: "/docs/api-files",
                title: "API 文件",
            },
            {
                href: "/docs/api-collections",
                title: "API 集合",
            },
            {
                href: "/docs/api-settings",
                title: "API 设置",
            },
            {
                href: "/docs/api-logs",
                title: "API 日志",
            },
            {
                href: "/docs/api-crons",
                title: "API 定时任务",
            },
            {
                href: "/docs/api-backups",
                title: "API 备份",
            },
            {
                href: "/docs/api-health",
                title: "API 健康检查",
            },
        ],
    },
]

export const goingToProductionLinks = [
    {
        href: "/docs/going-to-production",
        title: "上线部署",
        icon: "ri-check-double-line",
    },
];

export const goLinks = [
    {
        href: "/docs/go-overview",
        title: "概述",
    },
    {
        href: "/docs/go-event-hooks",
        title: "事件钩子",
    },
    {
        href: "/docs/go-routing",
        title: "路由",
    },
    {
        href: "/docs/go-database",
        title: "数据库",
    },
    {
        href: "/docs/go-records",
        title: "Record 操作",
    },
    {
        href: "/docs/go-collections",
        title: "Collection 操作",
    },
    {
        href: "/docs/go-migrations",
        title: "迁移",
    },
    {
        href: "/docs/go-jobs-scheduling",
        title: "任务调度",
    },
    {
        href: "/docs/go-sending-emails",
        title: "发送邮件",
    },
    {
        href: "/docs/go-rendering-templates",
        title: "模板渲染",
    },
    {
        href: "/docs/go-console-commands",
        title: "控制台命令",
    },
    {
        href: "/docs/go-realtime",
        title: "实时消息",
    },
    {
        href: "/docs/go-filesystem",
        title: "文件系统",
    },
    {
        href: "/docs/go-logging",
        title: "日志",
    },
    {
        href: "/docs/go-testing",
        title: "测试",
    },
    {
        href: "/docs/go-miscellaneous",
        title: "其他",
    },
    {
        href: "/docs/go-record-proxy",
        title: "Record 代理",
    },
];

export const jsLinks = [
    {
        href: "/docs/js-overview",
        title: "概述",
    },
    {
        href: "/docs/js-event-hooks",
        title: "事件钩子",
    },
    {
        href: "/docs/js-routing",
        title: "路由",
    },
    {
        href: "/docs/js-database",
        title: "数据库",
    },
    {
        href: "/docs/js-records",
        title: "Record 操作",
    },
    {
        href: "/docs/js-collections",
        title: "Collection 操作",
    },
    {
        href: "/docs/js-migrations",
        title: "迁移",
    },
    {
        href: "/docs/js-jobs-scheduling",
        title: "任务调度",
    },
    {
        href: "/docs/js-sending-emails",
        title: "发送邮件",
    },
    {
        href: "/docs/js-rendering-templates",
        title: "模板渲染",
    },
    {
        href: "/docs/js-console-commands",
        title: "控制台命令",
    },
    {
        href: "/docs/js-sending-http-requests",
        title: "发送 HTTP 请求",
    },
    {
        href: "/docs/js-realtime",
        title: "实时消息",
    },
    {
        href: "/docs/js-filesystem",
        title: "文件系统",
    },
    {
        href: "/docs/js-logging",
        title: "日志",
    },
    {
        href:   "/jsvm/index.html",
        target: "_blank",
        title:  "类型参考",
    },
];



export function hasPath(path, links = []) {
    if (!links) {
        return false;
    }

    for (let link of links) {
        if (
            equalPaths(path, link.href) ||
            hasPath(path, link.children)
        ) {
            return true;
        }
    }

    return false;
}

export function equalPaths(pathA, pathB) {
    return trimTrailingSlash(pathA) == trimTrailingSlash(pathB);
}

function trimTrailingSlash(url) {
    if (!url) {
        return "";
    }

    return url.endsWith("/") ? url.slice(0, -1) : url;
}
