import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { InputCurrency } from '@/components/ui/input-currency';
import { Combobox } from '@/components/ui/combobox';
import { useCreateExpense } from "@/features/expenses/hooks";
import { EXPENSE_CATEGORIES } from "@/types/domain";
import type { CreateExpensePayload } from "@/types/domain";


const formSchema = z.object({
  name: z.string({ message: "Nama tidak boleh kosong." }).min(2, { message: "Nama minimal 2 karakter." }),
  categoryId: z.string({ message: "Pilih kategori." }),
  totalAmount: z.number({ message: "Masukkan jumlah." }).positive({ message: "Jumlah harus positif." }),
  dueDate: z.date({ message: "Pilih tanggal jatuh tempo." }),
  notes: z.string().optional(),
  // installment specific
  downPayment: z.number().optional(),
  termCount: z.number().min(2, { message: "Cicilan minimal 2x." }),
}).refine(
  (v) => (v.downPayment ?? 0) < v.totalAmount,
  {
    // Real, meaningful validation: a DP that meets or exceeds the contract
    // leaves zero (or negative) to split across the remaining terms.
    path: ["downPayment"],
    message: "Uang muka tidak boleh sama atau melebihi total kontrak.",
  }
);

type InstallmentFormValues = z.infer<typeof formSchema>;

interface InstallmentExpenseFormProps {
  onSuccess?: () => void;
  /** When provided, the parent handles submission (e.g. over-budget guard) instead of mutating directly. */
  onValidSubmit?: (payload: CreateExpensePayload) => void;
}

const InstallmentExpenseForm = React.forwardRef<HTMLFormElement, InstallmentExpenseFormProps>(({ onSuccess, onValidSubmit }, ref) => {
  const createExpenseMutation = useCreateExpense();

  const form = useForm<InstallmentFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      notes: "",
      termCount: 2,
    },
  });

  function onSubmit(values: InstallmentFormValues) {
    const payload: CreateExpensePayload = {
      ...values,
      categoryId: values.categoryId as CreateExpensePayload['categoryId'],
      type: 'installments',
      downPayment: values.downPayment || 0,
    };
    if (onValidSubmit) {
      onValidSubmit(payload);
      return;
    }
    createExpenseMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      }
    });
  }

  return (
    <Form {...form}>
      <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pengeluaran</FormLabel>
              <FormControl>
                <Input placeholder="cth. DP Gedung Serbaguna" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
                <FormLabel>Kategori</FormLabel>
                <Combobox
          options={EXPENSE_CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
          value={field.value}
          onChange={field.onChange}
        />
                <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Kontrak</FormLabel>
                  <FormControl>
                    <InputCurrency value={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="downPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uang Muka (DP)</FormLabel>
                  <FormControl>
                    <InputCurrency placeholder="0" value={field.value ?? 0} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="termCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Cicilan</FormLabel>
                  <FormControl>
                    <Input type="number" min="2" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 2)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Jatuh Tempo Terakhir</FormLabel>
                   <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        {/* Submit button is rendered in the parent modal */}
      </form>
    </Form>
  );
});

export { InstallmentExpenseForm };
