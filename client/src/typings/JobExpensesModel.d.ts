interface JobExpensesModel {
  id: number;
  header: string;
  remarks?: string;
  jobId: number;
  serviceId: number;
  totalExpenses: number;
  JobExpensesItems: JobExpensesItemsModel[];
}
