/**
 * Customer-facing order progress. Payment is checked first so that an
 * abandoned checkout never appears to be in production.
 * Do not expose internal QC terminology directly to customers.
 */
export function customerOrderProgress(
  paymentStatus: string,
  productionStatus: string | null | undefined
): string {
  if (paymentStatus === 'refunded') return 'Payment Refunded';
  if (paymentStatus === 'failed') return 'Payment Failed';
  if (paymentStatus !== 'paid') return 'Awaiting Payment';

  switch (productionStatus) {
    case 'content_check': return 'Checking Your Memory';
    case 'ready_for_production': return 'Preparing Your Gift';
    case 'in_production': return 'Making Your Gift';
    case 'nfc_programming': return 'Connecting Your Memory';
    case 'quality_check': return 'Final Quality Check';
    case 'ready_to_dispatch': return 'Ready to Dispatch';
    case 'dispatched': return 'Dispatched';
    case 'on_hold': return 'Order Under Review';
    default: return 'Order Confirmed';
  }
}
