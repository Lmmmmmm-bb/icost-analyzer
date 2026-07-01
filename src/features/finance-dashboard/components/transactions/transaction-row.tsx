import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"

import type { RateMap, Transaction } from "../../model/types"
import { formatMoney, formatOriginalAmount, toRmb } from "../../model/money"
import {
  getDirectionBadgeVariant,
  getTransactionDirection,
} from "../../model/transaction-rules"

type TransactionRowProps = {
  transaction: Transaction
  rates: RateMap
}

export function TransactionRow({ transaction, rates }: TransactionRowProps) {
  const accountText = formatTransactionAccount(transaction)

  return (
    <TableRow className="group/tx">
      <TableCell className="font-mono text-[11px] text-muted-foreground transition-colors group-hover/tx:text-foreground">
        {transaction.dateText}
      </TableCell>
      <TableCell>
        <Badge
          variant={getDirectionBadgeVariant(
            getTransactionDirection(transaction)
          )}
        >
          {transaction.type}
        </Badge>
      </TableCell>
      <TableCell>
        {transaction.category} / {transaction.subcategory}
      </TableCell>
      <TableCell className="max-w-48 truncate" title={accountText}>
        {accountText}
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
        {formatOriginalAmount(transaction.amount, transaction.currency)}
      </TableCell>
      <TableCell className="font-mono text-[11px] font-medium tabular-nums">
        {formatMoney(toRmb(transaction, rates))}
      </TableCell>
    </TableRow>
  )
}

function formatTransactionAccount(transaction: Transaction) {
  if (transaction.type === "转账") {
    if (!transaction.account1 && !transaction.account2) return "未记录"

    return `${transaction.account1 || "未记录"} → ${
      transaction.account2 || "未记录"
    }`
  }

  return transaction.account1 || "未记录"
}
