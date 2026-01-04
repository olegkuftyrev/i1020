"use client"

import { useState } from "react"
import { ProductData } from "@/src/utils/pdfParser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ProductsTableProps {
  data: ProductData[]
  onDataChange: () => void
  onReplaceFile: (file: File) => void
}

function getAnomalyLevel(product: ProductData): 'none' | 'anomaly' | 'extreme' {
  const w38 = parseFloat(product.w38) || 0
  const w39 = parseFloat(product.w39) || 0
  const w40 = parseFloat(product.w40) || 0
  const w41 = parseFloat(product.w41) || 0
  
  const values = [w38, w39, w40, w41]
  const max = Math.max(...values)
  const min = Math.min(...values)
  const difference = max - min
  
  if (difference > 3) {
    return 'extreme'
  } else if (difference > 1) {
    return 'anomaly'
  }
  
  return 'none'
}

function getRowClassName(anomalyLevel: 'none' | 'anomaly' | 'extreme'): string {
  switch (anomalyLevel) {
    case 'extreme':
      return 'bg-red-500/10 border-red-500/30'
    case 'anomaly':
      return 'bg-yellow-500/10 border-yellow-500/30'
    default:
      return ''
  }
}

export function ProductsTable({ data, onDataChange, onReplaceFile }: ProductsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ProductData>>({})

  const handleEdit = (product: ProductData) => {
    setEditingId(product.productNumber)
    setEditValues({
      w38: product.w38,
      w39: product.w39,
      w40: product.w40,
      w41: product.w41,
    })
  }

  const handleSave = async (productNumber: string) => {
    // TODO: Implement save to API
    setEditingId(null)
    setEditValues({})
    onDataChange()
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-card/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product #</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>W38</TableHead>
              <TableHead>W39</TableHead>
              <TableHead>W40</TableHead>
              <TableHead>W41</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => {
              const anomalyLevel = getAnomalyLevel(product)
              const isEditing = editingId === product.productNumber
              
              return (
                <TableRow
                  key={product.productNumber}
                  className={getRowClassName(anomalyLevel)}
                >
                  <TableCell className="font-mono text-sm">
                    {product.productNumber}
                  </TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.w38 || ''}
                        onChange={(e) => setEditValues({ ...editValues, w38: e.target.value })}
                        className="w-20"
                      />
                    ) : (
                      product.w38
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.w39 || ''}
                        onChange={(e) => setEditValues({ ...editValues, w39: e.target.value })}
                        className="w-20"
                      />
                    ) : (
                      product.w39
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.w40 || ''}
                        onChange={(e) => setEditValues({ ...editValues, w40: e.target.value })}
                        className="w-20"
                      />
                    ) : (
                      product.w40
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.w41 || ''}
                        onChange={(e) => setEditValues({ ...editValues, w41: e.target.value })}
                        className="w-20"
                      />
                    ) : (
                      product.w41
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(product.productNumber)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

