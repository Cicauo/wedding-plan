import React from 'react';
import { PartyPopper, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { MasterBudgetBar } from "@/components/overview/MasterBudgetBar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Combobox } from "@/components/ui/combobox";
import { FileUploader } from "@/components/ui/file-uploader";
import { OneTimeExpenseCard } from "@/components/expenses/OneTimeExpenseCard";
import { InstallmentExpenseCard } from "@/components/expenses/InstallmentExpenseCard";
import { DUMMY_WEDDING_PLANS } from "@/features/wedding/mock-data";
import { MOCK_EXPENSES } from "@/features/expenses/mock-expense-data";
import { WeddingPlanProvider, useWeddingPlan } from '@/features/wedding/WeddingPlanContext';


function ComponentCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      <div className="p-4">
        <h3 className="mb-4 text-lg font-semibold tracking-tight">{title}</h3>
        <div className="flex flex-col space-y-4">{children}</div>
      </div>
    </div>
  );
}

const oneTimeSample = MOCK_EXPENSES.find(e => e.type === 'one-time')!;
const installmentSample = MOCK_EXPENSES.find(e => e.type === 'installments')!;

const ComponentsGrid = () => {
  const { weddingPlan } = useWeddingPlan();
  // In design system, we might not be in a real wedding plan context, so we'll use dummy data.
  const displayPlan = weddingPlan || DUMMY_WEDDING_PLANS[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ComponentCard title="Master Budget Bar" className="md:col-span-2 lg:col-span-3">
        <MasterBudgetBar
          totalBudget={displayPlan.totalBudget}
          totalExpenses={displayPlan.summary.totalExpenses}
          totalPaid={displayPlan.summary.totalPaid}
        />
      </ComponentCard>
      <ComponentCard title="Expense Cards">
        <div className="space-y-4">
          <OneTimeExpenseCard expense={oneTimeSample as any} />
          <InstallmentExpenseCard expense={installmentSample as any} />
        </div>
      </ComponentCard>
       <ComponentCard title="Badges & Pills">
         <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
         </div>
      </ComponentCard>

      <ComponentCard title="Segmented Control">
        <SegmentedControl
          value="option1"
          options={[
            { label: "One-Time", value: "one-time" },
            { label: "Installment", value: "installments" },
          ]}
          onValueChange={() => {}}
        />
      </ComponentCard>

       <ComponentCard title="Combobox">
        <Combobox
          options={displayPlan.expenses.map(e => ({label: e.name, value: e.id}))}
          value=""
          onChange={() => {}}
          placeholder="Cari pengeluaran..."
        />
      </ComponentCard>

      <ComponentCard title="File Uploader">
        <FileUploader onUpload={() => {}} onRemove={() => {}} state={{ status: 'idle' }} />
      </ComponentCard>
      
      <ComponentCard title="Empty State" className="md:col-span-2">
        <EmptyState
          icon={PartyPopper}
          title="Belum ada pengeluaran"
          description="Mulai dengan menambahkan item pengeluaran pertama untuk pernikahanmu."
          action={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Pengeluaran
            </Button>
          }
        />
      </ComponentCard>
    </div>
  );
};


export default function DesignSystem() {
    return (
        <div className="container mx-auto py-10">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
                <p className="mt-2 text-muted-foreground">
                    A living showcase of the foundational UI components.
                </p>
            </header>
            
            {/* We wrap with the provider to make context-dependent components work */}
            <WeddingPlanProvider>
                <ComponentsGrid />
            </WeddingPlanProvider>
        </div>
    )
}
