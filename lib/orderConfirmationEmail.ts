import { Resend } from 'resend';

export async function sendOrderConfirmation(orderId: string, isLivePayment: boolean) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_CONFIRMATION_EMAIL_FROM || process.env.DISPATCH_EMAIL_FROM;
  if (!apiKey || !from) return;

  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
  const { data: order, error } = await supabaseAdmin()
    .from('orders')
    .select('id, order_number, customer_email, total_pence')
    .eq('id', orderId)
    .eq('payment_status', 'paid')
    .single();
  if (error || !order?.customer_email) {
    console.error('Confirmation lookup failed', error);
    return;
  }

  const amount = (Number(order.total_pence) / 100).toFixed(2);
  const resend = new Resend(apiKey);
  const { error: sendError } = await resend.emails.send({
    from,
    to: order.customer_email,
    subject: (isLivePayment ? '' : '[TEST PAYMENT — NO REAL MONEY] ') + 'Smart Memories payment confirmed: ' + order.order_number,
    text: (isLivePayment ? '' : 'SANDBOX TEST ONLY. No real money was charged. Do not fulfil this order.\n\n') + 'Thank you for your order ' + order.order_number +
      '. Your payment of £' + amount +
      ' was confirmed. View your orders at https://smartmemories.co.uk/account/orders',
  }, { idempotencyKey: 'smart-memories-confirmation/' + order.id });
  if (sendError) console.error('Confirmation email failed', sendError);
}
