export type ProductionStatus =
  | 'new'
  | 'content_check'
  | 'ready_for_production'
  | 'in_production'
  | 'nfc_programming'
  | 'quality_check'
  | 'ready_to_dispatch'
  | 'dispatched'
  | 'on_hold';

export const productionStatuses:
  ProductionStatus[] = [
    'new',
    'content_check',
    'ready_for_production',
    'in_production',
    'nfc_programming',
    'quality_check',
    'ready_to_dispatch',
    'dispatched',
    'on_hold',
  ];

export function productionStatusLabel(
  value: string | null | undefined
) {
  switch (value) {
    case 'content_check':
      return 'Content Check';

    case 'ready_for_production':
      return 'Ready for Production';

    case 'in_production':
      return 'In Production';

    case 'nfc_programming':
      return 'NFC Programming';

    case 'quality_check':
      return 'Quality Check';

    case 'ready_to_dispatch':
      return 'Ready to Dispatch';

    case 'dispatched':
      return 'Dispatched';

    case 'on_hold':
      return 'On Hold';

    default:
      return 'New';
  }
}

export function normaliseProductionStatus(
  value: string | null | undefined
): ProductionStatus {
  return productionStatuses.includes(
    value as ProductionStatus
  )
    ? (value as ProductionStatus)
    : 'new';
}