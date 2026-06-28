import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"

import type { RateMap, Transaction } from "../../model/types"
import { formatMoney, isExpense, toRmb } from "../../model/utils"

type TransactionRowProps = {
  transaction: Transaction
  rates: RateMap
}

function transactionTypeVariant(transaction: Transaction) {
  if (isExpense(transaction)) return "destructive"
  return transaction.type === "转账" ? "outline" : "secondary"
}

export function TransactionRow({ transaction, rates }: TransactionRowProps) {
  return (
    <TableRow className="group/tx">
      <TableCell className="font-mono text-[11px] text-muted-foreground transition-colors group-hover/tx:text-foreground">
        {transaction.dateText}
      </TableCell>
      <TableCell>
        <Badge variant={transactionTypeVariant(transaction)}>
          {transaction.type}
        </Badge>
      </TableCell>
      <TableCell>
        {transaction.category} / {transaction.subcategory}
      </TableCell>
      <TableCell
        className="max-w-80 truncate"
        title={`${transaction.note} ${transaction.location}`}
      >
        {transaction.note || "无备注"}
        {transaction.location ? ` · ${transaction.location}` : ""}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {transaction.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="font-mono text-[11px]">
        {transaction.currency}
      </TableCell>
      <TableCell className="font-mono text-[11px] tabular-nums">
        {transaction.amount.toLocaleString("zh-CN", {
          maximumFractionDigits: 3,
        })}{" "}
        {transaction.currency}
      </TableCell>
      <TableCell className="font-mono text-[11px] font-medium tabular-nums">
        {formatMoney(toRmb(transaction, rates))}
      </TableCell>
    </TableRow>
  )
}
