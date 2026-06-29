# iCost Analyzer

iCost Analyzer 是一个本地优先的个人账单分析看板，用于读取 iCost 导出的
Excel 文件，并在浏览器中完成解析、筛选、汇总和图表分析。项目基于 Vite、
React、TypeScript、Tailwind CSS v4 和 shadcn/ui 构建。

> 上传的账单文件只在当前浏览器中解析。本仓库目前没有后端服务，也不会把
> Excel 文件发送到服务器。

## 功能

- 拖拽或点击上传 `.xlsx` / `.xls` 文件。
- 解析交易日期、金额、币种、类型、分类、标签、备注和地点。
- 支持时间、年份、日期区间、交易类型、币种、分类、标签和关键词筛选。
- 支持多币种折算，人民币 `CNY` 固定为基准币种。
- 展示总支出、总收入、净结余、月均/日均支出、最大单笔支出等指标。
- 提供月度趋势、分类占比、支出排行、币种分布、星期分布、标签排行和每日热力图。
- 支持分类/标签汇总表、交易明细表、分页和排序。
- 支持浅色、深色和系统主题，按 `d` 可以在非输入状态下切换主题。

## 技术栈

- Vite SPA
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui with Base UI primitives
- Remix Icon
- Apache ECharts
- SheetJS `xlsx`

## 快速开始

需要本机已安装较新的 Node.js LTS 和 `pnpm`。

```bash
pnpm install
pnpm dev
```

开发服务器启动后，打开终端中显示的本地地址即可使用。

构建生产版本：

```bash
pnpm build
pnpm preview
```

## 使用方式

1. 从 iCost 导出 Excel 账单。
2. 在首页把文件拖入页面任意位置，或点击上传区域选择文件。
3. 解析完成后进入仪表盘。
4. 按需要调整筛选条件和汇率。
5. 点击图表中的月份、分类或标签，可以联动筛选其他模块。

## Excel 字段

应用读取第一个工作表。至少需要可识别的日期和金额列；其他字段缺失时会使用
默认值。

| 含义     | 支持的列名                 |
| -------- | -------------------------- |
| 日期     | `日期`、`日期时间`、`时间` |
| 金额     | `金额`、`原始金额`         |
| 币种     | `货币`、`币种`、`Currency` |
| 类型     | `类型`、`交易类型`         |
| 一级分类 | `一级分类`、`分类`         |
| 二级分类 | `二级分类`、`子分类`       |
| 标签     | `标签`、`Tags`             |
| 备注     | `备注`、`说明`             |
| 地点     | `位置`、`地点`             |

解析规则：

- 日期或金额无法识别的行会被跳过。
- 未提供交易类型时，负数金额会被视为支出，非负数金额会被视为收入。
- 未提供币种时使用 `CNY`。
- 未提供分类或子分类时使用 `未分类`。
- 标签支持中文/英文逗号、顿号、分号、竖线和空格分隔，也支持 `#标签` 写法。
- 默认汇率是静态内置值，不会联网更新；可以在页面中手动修改。

## 项目结构

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    theme-provider.tsx
    ui/
  features/
    finance-dashboard/
      finance-dashboard.tsx
      model/
      components/
```

重点目录：

- `src/features/finance-dashboard/model`: 交易类型、汇率、筛选、金额和分析计算。
- `src/features/finance-dashboard/components/hero`: 首页上传、拖拽和 Excel 解析。
- `src/features/finance-dashboard/components/charts`: ECharts 封装和图表配置。
- `src/features/finance-dashboard/components/filters`: 筛选器。
- `src/features/finance-dashboard/components/rates`: 汇率设置。
- `src/features/finance-dashboard/components/summaries`: 分类和标签汇总表。
- `src/features/finance-dashboard/components/transactions`: 交易明细表和分页。
- `src/components/ui`: shadcn/ui 生成并纳入源码管理的组件。

## 常用命令

| 命令             | 说明                                   |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | 启动 Vite 开发服务器                   |
| `pnpm build`     | 运行 TypeScript 构建检查并生成 `dist`  |
| `pnpm preview`   | 本地预览生产构建                       |
| `pnpm lint`      | 运行 ESLint                            |
| `pnpm typecheck` | 运行 `tsc --noEmit`                    |
| `pnpm format`    | 使用 Prettier 格式化 `ts` / `tsx` 文件 |

当前项目还没有配置单元测试或 E2E 测试。提交前请至少运行：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## 贡献

欢迎提交 issue 和 pull request。参与开发时请注意：

- 使用 `pnpm`，不要混用其他包管理器生成锁文件。
- 保持 TypeScript 严格模式通过。
- 新增 shadcn/ui 组件时通过 shadcn CLI 添加，并检查生成代码。
- 样式优先使用语义化 token，例如 `bg-background`、`text-muted-foreground` 和
  `border-border`。
- 不要提交真实账单、隐私数据、`dist`、`demo.html` 或本地示例 Excel 文件。
- 改动 Excel 解析、数据口径、筛选逻辑或汇率逻辑时，同步更新文档。

`package.json` 当前保留了 `private: true`，用于避免误发布到 npm；这不影响仓库作为
开源应用源码公开。

## 许可证

当前仓库尚未包含 `LICENSE` 文件。正式公开分发前，请补充适合项目的开源许可证。
