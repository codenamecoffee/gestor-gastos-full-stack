/* 
  Use of a value/label mappings to display transaction 'types' and 'categories' 
  in Spanish but sended in English to backend.
*/

export type TransactionTypeOption = { value: string; label: string };
export const TRANSACTION_TYPES: TransactionTypeOption[] = [
    { value: 'Income', label: 'Ingreso' }, 
    { value: 'Expense', label: 'Gasto' }
];

export type CategoryOption = { value: string; label: string };
export const CATEGORIES: CategoryOption[] = [
    { value: 'Rent', label: 'Alquiler' },
    { value: 'BusTickets', label: 'Boletos' },
    { value: 'Hairdresser', label: 'Peluquería' },
    { value: 'Gym', label: 'Gimnasio' },
    { value: 'Streaming', label: 'Streaming' },
    { value: 'MobileCredit', label: 'Saldo' },
    { value: 'Consumables', label: 'Consumibles' },
    { value: 'Partner', label: 'Pareja' },
    { value: 'Unexpected', label: 'Imprevistos' },
];