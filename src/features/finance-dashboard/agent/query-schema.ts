import { z } from "zod"

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须是 YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return (
      year >= 1900 &&
      year <= 2100 &&
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    )
  }, "日期无效")

const namesSchema = z.array(z.string().trim().min(1).max(120)).max(30)

export const whereSchema = z.strictObject({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  types: namesSchema.optional(),
  categories: namesSchema.optional(),
  currencies: namesSchema.optional(),
  accounts: namesSchema.optional(),
  books: namesSchema.optional(),
  tags: namesSchema.optional(),
  excludedTags: namesSchema.optional(),
  keyword: z.string().trim().max(120).optional(),
})

export const scopeSchema = z.enum(["current_view", "all_data"])

const commonQueryFields = {
  expectedContextId: z.string().uuid(),
  scope: scopeSchema.optional(),
  where: whereSchema.optional(),
}

export const contextInputSchema = z.strictObject({})
export const summaryInputSchema = z.strictObject(commonQueryFields)
export const groupInputSchema = z.strictObject({
  ...commonQueryFields,
  dimension: z.enum([
    "month",
    "category",
    "subcategory",
    "account",
    "book",
    "tag",
    "currency",
  ]),
  limit: z.number().int().min(1).max(50).optional(),
})
export const periodSchema = z.strictObject({
  from: dateSchema,
  to: dateSchema,
})
export const compareInputSchema = z.strictObject({
  expectedContextId: z.string().uuid(),
  scope: scopeSchema.optional(),
  where: whereSchema.omit({ from: true, to: true }).optional(),
  currentPeriod: periodSchema,
  previousPeriod: periodSchema,
})

export type QueryWhere = z.infer<typeof whereSchema>
export type SummaryInput = z.infer<typeof summaryInputSchema>
export type GroupInput = z.infer<typeof groupInputSchema>
export type CompareInput = z.infer<typeof compareInputSchema>

export const inputSchemas = {
  get_ledger_context: contextInputSchema,
  summarize_ledger: summaryInputSchema,
  group_ledger: groupInputSchema,
  compare_periods: compareInputSchema,
} as const

export const jsonInputSchemas = {
  get_ledger_context: z.toJSONSchema(contextInputSchema, { target: "draft-7" }),
  summarize_ledger: z.toJSONSchema(summaryInputSchema, { target: "draft-7" }),
  group_ledger: z.toJSONSchema(groupInputSchema, { target: "draft-7" }),
  compare_periods: z.toJSONSchema(compareInputSchema, { target: "draft-7" }),
} satisfies Record<keyof typeof inputSchemas, Record<string, unknown>>
