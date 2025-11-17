import React, { useState } from "react";
import Layout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AddExpenseDialog from "@/components/dialog/AddExpenseDialog";
import type { ExpenseFormData } from "@/components/form/ExpenseForm";

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: "fixed" | "variable";
  isSplit: boolean;
  approved: boolean;
}

export default function Expenses() {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const onSubmit = (data: ExpenseFormData) => {
    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: data.description,
        amount: data.amount,
        date: data.date,
        type: data.type,
        isSplit: !!data.isSplit,
        approved: !data.isSplit, // require approval if split
      },
    ]);
    setIsDialogOpen(false);
  };

  const filteredExpenses = expenses.filter((e) => e.date.slice(0, 7) === filterMonth);
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (!isAuthenticated) {
    return <Layout><div className="p-8">Please log in to view expenses.</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-2">Expenses</h1>
            <p className="text-gray-600">Track shared and personal spending.</p>
          </div>
          <AddExpenseDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={onSubmit}
          />
        </div>

        <Card className="mb-6 shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Summary</span>
              <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">Total: ${total.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Expenses for {filterMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length === 0 ? (
              <p className="text-gray-500">No expenses for this period.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">{exp.date}</td>
                      <td className="p-2 whitespace-nowrap">{exp.description}</td>
                      <td className="p-2 whitespace-nowrap capitalize">{exp.type}</td>
                      <td className="p-2 text-right">${exp.amount.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        {exp.isSplit ? (exp.approved ? "Approved" : "Pending") : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
