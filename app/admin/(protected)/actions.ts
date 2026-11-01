'use server';

import { sendDispatchEmail } from '@/lib/dispatchEmail';

import {
  revalidatePath,
} from 'next/cache';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseAdminAuthClient,
} from '@/lib/supabaseAdminAuthServer';

import {
  supabaseAdmin,
} from '../../../lib/supabaseAdmin';

import {
  productionStatuses,
} from '../../../lib/production';

import type {
  ProductionStatus,
} from '../../../lib/production';

async function verifyOwner() {
  const supabase =
    await createSupabaseAdminAuthClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth
      .getUser();

  if (!user) {
    throw new Error(
      'Not authenticated'
    );
  }

  const allowedEmails =
    (
      process.env
        .ADMIN_EMAILS || ''
    )
      .split(',')
      .map(
        (email) =>
          email
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);

  const userEmail =
    user.email
      ?.toLowerCase() ||
    '';

  if (
    !allowedEmails.includes(
      userEmail
    )
  ) {
    throw new Error(
      'Not authorised'
    );
  }

  return {
    email: userEmail,
  };
}

function safeObject(
  value: unknown
): Record<string, any> {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      any
    >;
  }

  return {};
}

async function loadProductionData(
  orderId: string
) {
  const admin =
    supabaseAdmin();

  const {
    data,
    error,
  } =
    await admin
      .from('orders')
      .select(
        'production_data'
      )
      .eq(
        'id',
        orderId
      )
      .maybeSingle();

  if (
    error ||
    !data
  ) {
    throw new Error(
      'Could not load production data'
    );
  }

  return safeObject(
    data.production_data
  );
}

/* =========================================================
   EXISTING MEMORY STATUS ACTION
   ========================================================= */

export async function updateMemoryStatus(
  formData: FormData
) {
  await verifyOwner();

  const id =
    formData
      .get('id')
      ?.toString();

  const status =
    formData
      .get('status')
      ?.toString();

  if (!id) {
    throw new Error(
      'Memory ID is missing'
    );
  }

  if (
    ![
      'new',
      'in_production',
      'completed',
    ].includes(
      status || ''
    )
  ) {
    throw new Error(
      'Invalid status'
    );
  }

  const admin =
    supabaseAdmin();

  const completedAt =
    status ===
      'completed'
      ? new Date()
          .toISOString()
      : null;

  const {
    error,
  } =
    await admin
      .from('memories')
      .update({
        status,
        completed_at:
          completedAt,
      })
      .eq(
        'id',
        id
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    '/admin/completed'
  );

  revalidatePath(
    '/admin/memories'
  );
}

/* =========================================================
   ORDER PRODUCTION STATUS
   ========================================================= */

export async function updateOrderProductionStatus(
  formData: FormData
) {
  await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  const requestedStatus =
    formData
      .get('productionStatus')
      ?.toString();

  if (
    !orderId
  ) {
    throw new Error(
      'Order ID is missing'
    );
  }

  if (
    !productionStatuses.includes(
      requestedStatus as ProductionStatus
    )
  ) {
    throw new Error(
      'Invalid production status'
    );
  }

  /*
   * Ready to dispatch and dispatched
   * will be controlled later by the
   * final verification workflow.
   */
  if (
    requestedStatus ===
      'ready_to_dispatch' ||
    requestedStatus ===
      'dispatched'
  ) {
    throw new Error(
      'This status requires final verification.'
    );
  }

  const admin =
    supabaseAdmin();

  const {
    error,
  } =
    await admin
      .from('orders')
      .update({
        production_status:
          requestedStatus,
      })
      .eq(
        'id',
        orderId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/orders/${orderId}?saved=status`
  );
}

/* =========================================================
   ITEM PRODUCTION CHECKLIST
   ========================================================= */

export async function saveProductionChecklist(
  formData: FormData
) {
  await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  const itemId =
    formData
      .get('itemId')
      ?.toString();

  if (
    !orderId ||
    !itemId
  ) {
    throw new Error(
      'Order or item ID is missing'
    );
  }

  const current =
    await loadProductionData(
      orderId
    );

  const currentItems =
    safeObject(
      current.items
    );

  const currentItem =
    safeObject(
      currentItems[
        itemId
      ]
    );

  const currentProduction =
    safeObject(
      currentItem.production
    );

  const production = {
    ...currentProduction,

    blankSelected:
      formData.has(
        'blankSelected'
      ),

    designChecked:
      formData.has(
        'designChecked'
      ),

    printPrepared:
      formData.has(
        'printPrepared'
      ),

    printed:
      formData.has(
        'printed'
      ),

    physicalQualityChecked:
      formData.has(
        'physicalQualityChecked'
      ),

    updatedAt:
      new Date()
        .toISOString(),
  };

  const nextData = {
    ...current,

    items: {
      ...currentItems,

      [itemId]: {
        ...currentItem,
        production,
      },
    },
  };

  const admin =
    supabaseAdmin();

  const {
    error,
  } =
    await admin
      .from('orders')
      .update({
        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/orders/${orderId}?saved=checklist`
  );
}
/* =========================================================
   NFC + QR VERIFICATION
   ========================================================= */

export async function saveNfcChecks(
  formData: FormData
) {
  await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  const itemId =
    formData
      .get('itemId')
      ?.toString();

  if (
    !orderId ||
    !itemId
  ) {
    throw new Error(
      'Order or item ID is missing'
    );
  }

  const admin =
    supabaseAdmin();

  /*
   * Re-check the actual database
   * relationship before saving.
   */
  const {
    data: item,
    error: itemError,
  } =
    await admin
      .from('order_items')
      .select(
        `
          id,
          order_id,
          product_name,
          memory_code
        `
      )
      .eq(
        'id',
        itemId
      )
      .eq(
        'order_id',
        orderId
      )
      .maybeSingle();

  if (
    itemError ||
    !item
  ) {
    throw new Error(
      'This item does not belong to this order.'
    );
  }

  const memoryCode =
    item.memory_code
      ?.trim()
      .toUpperCase();

  if (!memoryCode) {
    throw new Error(
      'This item has no Smart Memory code.'
    );
  }

  const {
    data: memory,
    error: memoryError,
  } =
    await admin
      .from('memories')
      .select(
        `
          code,
          recipient_name
        `
      )
      .eq(
        'code',
        memoryCode
      )
      .maybeSingle();

  if (
    memoryError ||
    !memory
  ) {
    throw new Error(
      'The linked Smart Memory could not be verified.'
    );
  }

  const pairingVerified =
    formData.has(
      'pairingVerified'
    );

  const programmed =
    formData.has(
      'programmed'
    );

  const tested =
    formData.has(
      'tested'
    );

  const qrTested =
    formData.has(
      'qrTested'
    );

  /*
   * Never permit NFC / QR completion
   * until the physical-item pairing
   * has been manually confirmed.
   */
  if (
    (
      programmed ||
      tested ||
      qrTested
    ) &&
    !pairingVerified
  ) {
    throw new Error(
      'Verify the product, recipient and memory code first.'
    );
  }

  if (
    tested &&
    !programmed
  ) {
    throw new Error(
      'The NFC tag must be programmed before it can be marked as tested.'
    );
  }

  const current =
    await loadProductionData(
      orderId
    );

  const currentItems =
    safeObject(
      current.items
    );

  const currentItem =
    safeObject(
      currentItems[
        itemId
      ]
    );

  const currentNfc =
    safeObject(
      currentItem.nfc
    );

  const currentQr =
    safeObject(
      currentItem.qr
    );

  const updatedAt =
    new Date()
      .toISOString();

  const nextData = {
    ...current,

    items: {
      ...currentItems,

      [itemId]: {
        ...currentItem,

        nfc: {
          ...currentNfc,

          pairingVerified,
          programmed,
          tested,
          updatedAt,
        },

        qr: {
          ...currentQr,

          tested:
            qrTested,

          updatedAt,
        },
      },
    },
  };

  const {
    error,
  } =
    await admin
      .from('orders')
      .update({
        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/orders/${orderId}?saved=nfc`
  );
}
/* =========================================================
   FINAL QUALITY CONTROL
   ========================================================= */

export async function saveQualityChecks(
  formData: FormData
) {
  await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  const itemId =
    formData
      .get('itemId')
      ?.toString();

  if (
    !orderId ||
    !itemId
  ) {
    throw new Error(
      'Order or item ID is missing'
    );
  }

  const admin =
    supabaseAdmin();

  /*
   * Confirm this item genuinely belongs
   * to the order before saving QA data.
   */
  const {
    data: item,
    error: itemError,
  } =
    await admin
      .from('order_items')
      .select(
        `
          id,
          order_id,
          product_type,
          product_name,
          memory_code
        `
      )
      .eq(
        'id',
        itemId
      )
      .eq(
        'order_id',
        orderId
      )
      .maybeSingle();

  if (
    itemError ||
    !item
  ) {
    throw new Error(
      'This item does not belong to this order.'
    );
  }

  const physicalProductChecked =
    formData.has(
      'physicalProductChecked'
    );

  const personalisationChecked =
    formData.has(
      'personalisationChecked'
    );

  const memoryExperienceChecked =
    formData.has(
      'memoryExperienceChecked'
    );

  const finalPairingConfirmed =
    formData.has(
      'finalPairingConfirmed'
    );

  const finalQualityApproved =
    formData.has(
      'finalQualityApproved'
    );

  /*
   * Smart products require the final
   * memory pairing confirmation.
   * Traditional non-smart cards do not.
   */
  const requiresMemory =
    item.product_type !==
      'traditional-card';

  if (
    requiresMemory &&
    (
      memoryExperienceChecked ||
      finalPairingConfirmed
    )
  ) {
    const memoryCode =
      item.memory_code
        ?.trim()
        .toUpperCase();

    if (!memoryCode) {
      throw new Error(
        'This product has no Smart Memory code.'
      );
    }

    const {
      data: memory,
      error: memoryError,
    } =
      await admin
        .from('memories')
        .select(
          `
            code,
            recipient_name
          `
        )
        .eq(
          'code',
          memoryCode
        )
        .maybeSingle();

    if (
      memoryError ||
      !memory
    ) {
      throw new Error(
        'The linked Smart Memory could not be verified.'
      );
    }
  }

  const current =
    await loadProductionData(
      orderId
    );

  const currentItems =
    safeObject(
      current.items
    );

  const currentItem =
    safeObject(
      currentItems[
        itemId
      ]
    );

  const currentQuality =
    safeObject(
      currentItem.quality
    );

  const quality = {
    ...currentQuality,

    physicalProductChecked,

    personalisationChecked,

    memoryExperienceChecked:
      requiresMemory
        ? memoryExperienceChecked
        : true,

    finalPairingConfirmed:
      requiresMemory
        ? finalPairingConfirmed
        : true,

    finalQualityApproved,

    updatedAt:
      new Date()
        .toISOString(),
  };

  const nextData = {
    ...current,

    items: {
      ...currentItems,

      [itemId]: {
        ...currentItem,
        quality,
      },
    },
  };

  const {
    error,
  } =
    await admin
      .from('orders')
      .update({
        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/orders/${orderId}?saved=quality`
  );
}
/* =========================================================
   FINAL ORDER VERIFICATION
   ========================================================= */

export async function approveReadyToDispatch(
  formData: FormData
) {
  await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  if (!orderId) {
    throw new Error(
      'Order ID is missing'
    );
  }

  const admin =
    supabaseAdmin();

  const {
    data: order,
    error: orderError,
  } =
    await admin
      .from('orders')
      .select(
        `
          id,
          production_data,
          order_items (
            id,
            product_type,
            product_name,
            memory_code
          )
        `
      )
      .eq(
        'id',
        orderId
      )
      .maybeSingle();

  if (
    orderError ||
    !order
  ) {
    throw new Error(
      'Order could not be verified.'
    );
  }

  const productionData =
    safeObject(
      order.production_data
    );

  const savedItems =
    safeObject(
      productionData.items
    );

  if (
    !order.order_items ||
    order.order_items.length === 0
  ) {
    throw new Error(
      'Order has no production items.'
    );
  }

  for (
    const item of
      order.order_items
  ) {
    const savedItem =
      safeObject(
        savedItems[
          item.id
        ]
      );

    const production =
      safeObject(
        savedItem.production
      );

    const nfc =
      safeObject(
        savedItem.nfc
      );

    const qr =
      safeObject(
        savedItem.qr
      );

    const quality =
      safeObject(
        savedItem.quality
      );

    const productionComplete =
      Boolean(
        production.blankSelected
      ) &&
      Boolean(
        production.designChecked
      ) &&
      Boolean(
        production.printPrepared
      ) &&
      Boolean(
        production.printed
      ) &&
      Boolean(
        production.physicalQualityChecked
      );

    if (
      !productionComplete
    ) {
      throw new Error(
        `${item.product_name}: production checklist is incomplete.`
      );
    }

    const requiresMemory =
      item.product_type !==
        'traditional-card';

    if (
      requiresMemory
    ) {
      const memoryCode =
        item.memory_code
          ?.trim()
          .toUpperCase();

      if (!memoryCode) {
        throw new Error(
          `${item.product_name}: Smart Memory code is missing.`
        );
      }

      const {
        data: memory,
        error: memoryError,
      } =
        await admin
          .from('memories')
          .select(
            `
              code,
              recipient_name
            `
          )
          .eq(
            'code',
            memoryCode
          )
          .maybeSingle();

      if (
        memoryError ||
        !memory
      ) {
        throw new Error(
          `${item.product_name}: linked Smart Memory could not be verified.`
        );
      }

      const smartChecksComplete =
        Boolean(
          nfc.pairingVerified
        ) &&
        Boolean(
          nfc.programmed
        ) &&
        Boolean(
          nfc.tested
        ) &&
        Boolean(
          qr.tested
        );

      if (
        !smartChecksComplete
      ) {
        throw new Error(
          `${item.product_name}: NFC / QR verification is incomplete.`
        );
      }
    }

    const qualityComplete =
      Boolean(
        quality.physicalProductChecked
      ) &&
      Boolean(
        quality.personalisationChecked
      ) &&
      Boolean(
        quality.finalQualityApproved
      ) &&
      (
        item.product_type ===
          'traditional-card' ||
        (
          Boolean(
            quality.memoryExperienceChecked
          ) &&
          Boolean(
            quality.finalPairingConfirmed
          )
        )
      );

    if (
      !qualityComplete
    ) {
      throw new Error(
        `${item.product_name}: final quality control is incomplete.`
      );
    }
  }

  const verification = {
    approved:
      true,

    approvedAt:
      new Date()
        .toISOString(),
  };

  const nextData = {
    ...productionData,

    finalVerification:
      verification,
  };

  const {
    error: updateError,
  } =
    await admin
      .from('orders')
      .update({
        production_status:
          'ready_to_dispatch',

        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (updateError) {
    throw new Error(
      updateError.message
    );
  }

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/orders/${orderId}?saved=ready`
  );
}
/* =========================================================
   INTERNAL ORDER NOTES
   ========================================================= */

export async function addInternalOrderNote(
  formData: FormData
) {
  const owner =
    await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  const note =
    formData
      .get('note')
      ?.toString()
      .trim();

  if (!orderId) {
    throw new Error(
      'Order ID is missing'
    );
  }

  if (!note) {
    throw new Error(
      'Note cannot be empty'
    );
  }

  if (note.length > 2000) {
    throw new Error(
      'Note is too long'
    );
  }

  const current =
    await loadProductionData(
      orderId
    );

  const currentNotes =
    Array.isArray(
      current.notes
    )
      ? current.notes
      : [];

  const nextData = {
    ...current,

    notes: [
      ...currentNotes,

      {
        id:
          crypto.randomUUID(),

        text:
          note,

        createdAt:
          new Date()
            .toISOString(),

        createdBy:
          owner.email,
      },
    ],
  };

  const admin =
    supabaseAdmin();

  const {
    error,
  } =
    await admin
      .from('orders')
      .update({
        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/orders/${orderId}?saved=note`
  );
}


/* =========================================================
   SAVE DISPATCH DETAILS
   ========================================================= */

export async function saveDispatchDetails(
  formData: FormData
) {
  await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  const carrier =
    formData
      .get('carrier')
      ?.toString()
      .trim() || '';

  const trackingNumber =
    formData
      .get('trackingNumber')
      ?.toString()
      .trim() || '';

  const dispatchNote =
    formData
      .get('dispatchNote')
      ?.toString()
      .trim() || '';

  if (!orderId) {
    throw new Error(
      'Order ID is missing'
    );
  }

  const current =
    await loadProductionData(
      orderId
    );

  const currentDispatch =
    safeObject(
      current.dispatch
    );

  const nextData = {
    ...current,

    dispatch: {
      ...currentDispatch,

      carrier,
      trackingNumber,
      note:
        dispatchNote,

      updatedAt:
        new Date()
          .toISOString(),
    },
  };

  const admin =
    supabaseAdmin();

  const {
    error,
  } =
    await admin
      .from('orders')
      .update({
        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  redirect(
    `/admin/orders/${orderId}?saved=dispatch`
  );
}


/* =========================================================
   MARK ORDER DISPATCHED
   ========================================================= */

async function attemptDispatchEmail(
  orderId: string
) {
  const admin =
    supabaseAdmin();

  const {
    data: order,
    error,
  } =
    await admin
      .from('orders')
      .select(
        `
          id,
          order_number,
          customer_name,
          customer_email,
          production_status,
          production_data
        `
      )
      .eq(
        'id',
        orderId
      )
      .maybeSingle();

  if (
    error ||
    !order
  ) {
    throw new Error(
      'Order could not be loaded for dispatch email.'
    );
  }

  if (
    order.production_status !==
      'dispatched'
  ) {
    throw new Error(
      'Dispatch email can only be sent for a dispatched order.'
    );
  }

  const productionData =
    safeObject(
      order.production_data
    );

  const dispatch =
    safeObject(
      productionData.dispatch
    );

  /*
   * Duplicate-send protection.
   * Once a successful send time exists,
   * never send this dispatch email again.
   */
  if (
    dispatch.dispatchEmailSentAt
  ) {
    return {
      alreadySent: true,
      sent: true,
    };
  }

  const attemptedAt =
    new Date()
      .toISOString();

  const result =
    await sendDispatchEmail({
      customerEmail:
        order.customer_email,

      customerName:
        order.customer_name,

      orderNumber:
        order.order_number,

      carrier:
        typeof dispatch.carrier ===
          'string'
          ? dispatch.carrier
          : null,

      trackingNumber:
        typeof dispatch.trackingNumber ===
          'string'
          ? dispatch.trackingNumber
          : null,
    });

  const nextDispatch = {
    ...dispatch,

    dispatchEmailAttemptedAt:
      attemptedAt,

    dispatchEmailSentAt:
      result.sent
        ? attemptedAt
        : null,

    dispatchEmailMessageId:
      result.sent
        ? result.messageId
        : null,

    dispatchEmailError:
      result.sent
        ? null
        : result.reason,
  };

  const nextData = {
    ...productionData,

    dispatch:
      nextDispatch,
  };

  const {
    error: updateError,
  } =
    await admin
      .from('orders')
      .update({
        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (updateError) {
    throw new Error(
      updateError.message
    );
  }

  return {
    alreadySent: false,
    sent:
      result.sent,
  };
}


/* =========================================================
   MARK ORDER DISPATCHED
   ========================================================= */

export async function markOrderDispatched(
  formData: FormData
) {
  const owner =
    await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  if (!orderId) {
    throw new Error(
      'Order ID is missing'
    );
  }

  const admin =
    supabaseAdmin();

  const {
    data: order,
    error: orderError,
  } =
    await admin
      .from('orders')
      .select(
        `
          id,
          production_status,
          production_data
        `
      )
      .eq(
        'id',
        orderId
      )
      .maybeSingle();

  if (
    orderError ||
    !order
  ) {
    throw new Error(
      'Order could not be loaded.'
    );
  }

  if (
    order.production_status !==
      'ready_to_dispatch'
  ) {
    throw new Error(
      'Order must pass final verification before dispatch.'
    );
  }

  const current =
    safeObject(
      order.production_data
    );

  const currentDispatch =
    safeObject(
      current.dispatch
    );

  const dispatchedAt =
    new Date()
      .toISOString();

  const nextData = {
    ...current,

    dispatch: {
      ...currentDispatch,

      dispatchedAt,

      dispatchedBy:
        owner.email,
    },
  };

  const {
    error: updateError,
  } =
    await admin
      .from('orders')
      .update({
        production_status:
          'dispatched',

        status:
          'dispatched',

        production_data:
          nextData,
      })
      .eq(
        'id',
        orderId
      );

  if (updateError) {
    throw new Error(
      updateError.message
    );
  }

  /*
   * Dispatch is saved first.
   * Email failure must never undo
   * the actual dispatch status.
   */
  const emailResult =
    await attemptDispatchEmail(
      orderId
    );

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  revalidatePath(
    '/account/orders'
  );

  redirect(
    emailResult.sent
      ? `/admin/orders/${orderId}?saved=dispatched-email`
      : `/admin/orders/${orderId}?saved=dispatched-email-failed`
  );
}


/* =========================================================
   RETRY DISPATCH EMAIL
   ========================================================= */

export async function sendOrderDispatchEmail(
  formData: FormData
) {
  await verifyOwner();

  const orderId =
    formData
      .get('orderId')
      ?.toString();

  if (!orderId) {
    throw new Error(
      'Order ID is missing'
    );
  }

  const result =
    await attemptDispatchEmail(
      orderId
    );

  revalidatePath(
    `/admin/orders/${orderId}`
  );

  if (
    result.alreadySent
  ) {
    redirect(
      `/admin/orders/${orderId}?saved=email-already-sent`
    );
  }

  redirect(
    result.sent
      ? `/admin/orders/${orderId}?saved=email-sent`
      : `/admin/orders/${orderId}?saved=email-failed`
  );
}