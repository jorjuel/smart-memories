import Link from 'next/link';
import { notFound } from 'next/navigation';

import QRCode from 'qrcode';

import CopyMemoryUrlButton from '@/components/admin/CopyMemoryUrlButton';

import {
  getMemoryPublicUrl,
} from '@/lib/memoryUrl';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

import {
  normaliseProductionStatus,
  productionStatusLabel,
} from '@/lib/production';

import {
  updateOrderProductionStatus,
  saveProductionChecklist,
  saveNfcChecks,
  saveQualityChecks,
  approveReadyToDispatch,
  addInternalOrderNote,
  saveDispatchDetails,
  markOrderDispatched,
  sendOrderDispatchEmail,
} from '../../actions';

export const dynamic =
  'force-dynamic';

type OrderItem = {
  id: string;
  product_type: string;
  product_slug: string | null;
  product_name: string;
  quantity: number;
  unit_price_pence: number;
  memory_code: string | null;
  image_url: string | null;
  personalisation: unknown;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string;
  delivery_name: string | null;
  delivery_address_1: string | null;
  delivery_address_2: string | null;
  delivery_city: string | null;
  delivery_postcode: string | null;
  delivery_method: string | null;
  subtotal_pence: number;
  delivery_pence: number;
  total_pence: number;
  payment_status: string;
  stripe_checkout_session_id: string | null;
  status: string;
  production_status: string;
  production_data: unknown;
  created_at: string;
  order_items: OrderItem[];
};

type Memory = {
  code: string;
  recipient_name: string;
  sender_name: string | null;
  message: string | null;
  photo_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  created_at: string;
};

function money(
  pence: number
) {
  return new Intl.NumberFormat(
    'en-GB',
    {
      style: 'currency',
      currency: 'GBP',
    }
  ).format(
    pence / 100
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(
    new Date(value)
  );
}

function getPersonalisationEntries(
  value: unknown
) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return [];
  }

  return Object.entries(
    value as Record<
      string,
      unknown
    >
  ).filter(
    ([, item]) =>
      item !== null &&
      item !== undefined &&
      item !== ''
  );
}

function displayValue(
  value: unknown
) {
  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  if (
    typeof value === 'boolean'
  ) {
    return value
      ? 'Yes'
      : 'No';
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        (item) =>
          String(item)
      )
      .join(', ');
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return JSON.stringify(
      value
    );
  }

  return '';
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    saved?: string;
  }>;
}) {
  const {
    id,
  } = await params;

  const query =
    await searchParams;

  const admin =
    supabaseAdmin();

  const {
    data,
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
          delivery_name,
          delivery_address_1,
          delivery_address_2,
          delivery_city,
          delivery_postcode,
          delivery_method,
          subtotal_pence,
          delivery_pence,
          total_pence,
          payment_status,
          stripe_checkout_session_id,
          status,
          production_status,
          production_data,
          created_at,
          order_items (
            id,
            product_type,
            product_slug,
            product_name,
            quantity,
            unit_price_pence,
            memory_code,
            image_url,
            personalisation
          )
        `
      )
      .eq(
        'id',
        id
      )
      .maybeSingle();

  if (
    error ||
    !data
  ) {
    if (error) {
      console.error(
        'ADMIN ORDER DETAIL ERROR:',
        error
      );
    }

    notFound();
  }

  const order =
    data as unknown as Order;

  const codes =
    order.order_items
      .map(
        (item) =>
          item.memory_code
            ?.trim()
            .toUpperCase()
      )
      .filter(
        (
          code
        ): code is string =>
          Boolean(code)
      );

  let memories:
    Memory[] = [];

  if (
    codes.length >
    0
  ) {
    const {
      data:
        memoryData,
      error:
        memoryError,
    } =
      await admin
        .from('memories')
        .select(
          `
            code,
            recipient_name,
            sender_name,
            message,
            photo_url,
            audio_url,
            video_url,
            created_at
          `
        )
        .in(
          'code',
          codes
        );

    if (
      memoryError
    ) {
      console.error(
        'ADMIN ORDER MEMORY ERROR:',
        memoryError
      );
    } else {
      memories =
        (memoryData ||
          []) as Memory[];
    }
  }

  const memoryMap =
    new Map(
      memories.map(
        (memory) => [
          memory.code,
          memory,
        ]
      )
    );

  const qrMap =
    new Map<
      string,
      {
        url: string;
        qrDataUrl: string;
      }
    >();

  for (
    const item of
      order.order_items
  ) {
    const code =
      item.memory_code
        ?.trim()
        .toUpperCase();

    if (!code) {
      continue;
    }

    /*
     * Do not generate production QR
     * if the memory itself is missing.
     */
    if (
      !memoryMap.has(
        code
      )
    ) {
      continue;
    }

    const url =
      getMemoryPublicUrl(
        code
      );

    const qrDataUrl =
      await QRCode.toDataURL(
        url,
        {
          width: 300,
          margin: 1,
          errorCorrectionLevel:
            'M',
        }
      );

    qrMap.set(
      item.id,
      {
        url,
        qrDataUrl,
      }
    );
  }

  const productionStatus =
    normaliseProductionStatus(
      order.production_status
    );

  const productionData =
    order.production_data &&
    typeof order.production_data ===
      'object' &&
    !Array.isArray(
      order.production_data
    )
      ? order.production_data as Record<string, any>
      : {};

  const itemProductionData =
    productionData.items &&
    typeof productionData.items ===
      'object'
      ? productionData.items as Record<string, any>
      : {};

  const dispatchData =
    productionData.dispatch &&
    typeof productionData.dispatch ===
      'object'
      ? productionData.dispatch as Record<string, any>
      : {};

  const internalNotes =
    Array.isArray(
      productionData.notes
    )
      ? productionData.notes as Array<{
          id?: string;
          text?: string;
          createdAt?: string;
          createdBy?: string;
        }>
      : [];

  const readiness =
    order.order_items.map(
      (item) => {
        const savedItem =
          itemProductionData[
            item.id
          ] || {};

        const production =
          savedItem.production ||
          {};

        const nfc =
          savedItem.nfc ||
          {};

        const qr =
          savedItem.qr ||
          {};

        const quality =
          savedItem.quality ||
          {};

        const productionReady =
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

        const requiresMemory =
          item.product_type !==
            'traditional-card';

        const smartReady =
          !requiresMemory ||
          (
            Boolean(
              item.memory_code
            ) &&
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
            )
          );

        const qualityReady =
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
            !requiresMemory ||
            (
              Boolean(
                quality.memoryExperienceChecked
              ) &&
              Boolean(
                quality.finalPairingConfirmed
              )
            )
          );

        return {
          itemId:
            item.id,

          productName:
            item.product_name,

          productionReady,

          smartReady,

          qualityReady,

          complete:
            productionReady &&
            smartReady &&
            qualityReady,
        };
      }
    );

  const allItemsReady =
    readiness.length > 0 &&
    readiness.every(
      (item) =>
        item.complete
    );

  return (
    <section className="wrap smAdminOrderDetail">
      <div className="smAdminPageHeading">
        <div>
          <span className="eyebrow">
            PRODUCTION ORDER
          </span>

          <h1>
            Order #
            {order.order_number}
          </h1>

          <p className="lead">
            Verify the physical gift
            and its Smart Memory
            before production.
          </p>
        </div>

        <div className="smAdminOrderDetailActions">
          <Link
            href="/admin/orders"
            className="btn secondary"
          >
            Back to Orders
          </Link>

          <span
            className={`smAdminStatus smAdminStatus-${productionStatus}`}
          >
            {productionStatusLabel(
              productionStatus
            )}
          </span>
        </div>
      </div>

      {query.saved === 'status' && (
        <div className="smAdminSaveSuccess">
          Production status updated.
        </div>
      )}

      {query.saved === 'checklist' && (
        <div className="smAdminSaveSuccess">
          Production checklist saved.
        </div>
      )}

      {query.saved === 'nfc' && (
        <div className="smAdminSaveSuccess">
          NFC and QR checks saved.
        </div>
      )}

      {query.saved === 'quality' && (
        <div className="smAdminSaveSuccess">
          Final quality checks saved.
        </div>
      )}

      {query.saved === 'ready' && (
        <div className="smAdminSaveSuccess">
          Final verification passed.
          Order is ready to dispatch.
        </div>
      )}

      {query.saved === 'note' && (
        <div className="smAdminSaveSuccess">
          Internal note added.
        </div>
      )}

      {query.saved === 'dispatch' && (
        <div className="smAdminSaveSuccess">
          Dispatch details saved.
        </div>
      )}

      {query.saved === 'dispatched' && (
        <div className="smAdminSaveSuccess">
          Order marked as dispatched.
        </div>
      )}

      {query.saved === 'dispatched-email' && (
        <div className="smAdminSaveSuccess">
          Order dispatched and customer confirmation email sent.
        </div>
      )}

      {query.saved === 'dispatched-email-failed' && (
        <div className="smAdminEmailWarning">
          Order was dispatched successfully, but the customer email was not sent.
        </div>
      )}

      {query.saved === 'email-sent' && (
        <div className="smAdminSaveSuccess">
          Customer dispatch email sent.
        </div>
      )}

      {query.saved === 'email-failed' && (
        <div className="smAdminEmailWarning">
          Dispatch email could not be sent. Check the email configuration below.
        </div>
      )}

      {query.saved === 'email-already-sent' && (
        <div className="smAdminSaveSuccess">
          Dispatch email was already sent. No duplicate email was created.
        </div>
      )}

      <section className="smAdminDetailSection">
        <span className="eyebrow">
          WORKFLOW
        </span>

        <h2>
          Production Status
        </h2>

        <form
          action={
            updateOrderProductionStatus
          }
          className="card smAdminStatusForm"
        >
          <input
            type="hidden"
            name="orderId"
            value={
              order.id
            }
          />

          <label>
            <span>
              Current production stage
            </span>

            <select
              name="productionStatus"
              defaultValue={
                productionStatus
              }
            >
              <option value="new">
                New
              </option>

              <option value="content_check">
                Content Check
              </option>

              <option value="ready_for_production">
                Ready for Production
              </option>

              <option value="in_production">
                In Production
              </option>

              <option value="nfc_programming">
                NFC Programming
              </option>

              <option value="quality_check">
                Quality Check
              </option>

              <option value="on_hold">
                On Hold
              </option>
            </select>
          </label>

          <button
            type="submit"
            className="btn"
          >
            Update Production Status
          </button>

          <small>
            Ready to Dispatch and
            Dispatched are locked until
            final verification is added.
          </small>
        </form>
      </section>

      <div className="smAdminDetailSummaryGrid">
        <article className="card">
          <span className="eyebrow">
            CUSTOMER
          </span>

          <h2>
            {order.customer_name ||
              'Customer'}
          </h2>

          <p>
            {order.customer_email}
          </p>

          <p>
            Ordered{' '}
            {formatDate(
              order.created_at
            )}
          </p>
        </article>

        <article className="card">
          <span className="eyebrow">
            PAYMENT
          </span>

          <h2>
            {money(
              order.total_pence
            )}
          </h2>

          <p>
{order.stripe_checkout_session_id?.startsWith('cs_test_') && (
              <span style={{ display: 'inline-block', padding: '5px 10px', background: '#fff1d9', borderRadius: '8px', fontWeight: 700 }}>
                TEST PAYMENT — NOT REAL REVENUE
              </span>
            )}
            {order.stripe_checkout_session_id?.startsWith('cs_live_') && (
              <span style={{ display: 'inline-block', padding: '5px 10px', background: '#e5f6eb', borderRadius: '8px', fontWeight: 700 }}>
                LIVE PAYMENT
              </span>
            )}
            {!order.stripe_checkout_session_id && (
              <span style={{ fontWeight: 600 }}>Payment mode unverified</span>
            )}
                        Payment:{' '}
            <strong>
              {
                order.payment_status
              }
            </strong>
          </p>

          <p>
            Customer status:{' '}
            <strong>
              {order.status}
            </strong>
          </p>
        </article>

        <article className="card">
          <span className="eyebrow">
            PRODUCTION
          </span>

          <h2>
            {productionStatusLabel(
              productionStatus
            )}
          </h2>

          <p>
            Internal production
            workflow.
          </p>
        </article>
      </div>

      <section className="smAdminDetailSection">
        <span className="eyebrow">
          DELIVERY
        </span>

        <h2>
          Delivery Information
        </h2>

        <div className="card smAdminDeliveryCard">
          <strong>
            {order.delivery_name ||
              order.customer_name ||
              'Customer'}
          </strong>

          {order.delivery_address_1 && (
            <span>
              {
                order.delivery_address_1
              }
            </span>
          )}

          {order.delivery_address_2 && (
            <span>
              {
                order.delivery_address_2
              }
            </span>
          )}

          {order.delivery_city && (
            <span>
              {
                order.delivery_city
              }
            </span>
          )}

          {order.delivery_postcode && (
            <span>
              {
                order.delivery_postcode
              }
            </span>
          )}

          <span>
            Delivery method:{' '}
            <strong>
              {order.delivery_method ||
                'Not recorded'}
            </strong>
          </span>
        </div>
      </section>

      <section className="smAdminDetailSection">
        <span className="eyebrow">
          PHYSICAL GIFTS
        </span>

        <h2>
          Products to Produce
        </h2>

        <div className="smAdminDetailItems">
          {order.order_items.map(
            (item) => {
              const code =
                item.memory_code
                  ?.trim()
                  .toUpperCase() ||
                null;

              const memory =
                code
                  ? memoryMap.get(
                      code
                    )
                  : undefined;

              const personalisation =
                getPersonalisationEntries(
                  item.personalisation
                );

              const savedItem =
                itemProductionData[
                  item.id
                ] || {};

              const savedProduction =
                savedItem.production ||
                {};

              const savedNfc =
                savedItem.nfc ||
                {};

              const savedQr =
                savedItem.qr ||
                {};

              const savedQuality =
                savedItem.quality ||
                {};

              const smartLink =
                qrMap.get(
                  item.id
                );

              return (
                <article
                  key={item.id}
                  className="smAdminProductionItem"
                >
                  <div className="smAdminProductionItemTop">
                    <div className="smAdminProductionImage">
                      {item.image_url ? (
                        <img
                          src={
                            item.image_url
                          }
                          alt=""
                        />
                      ) : (
                        <span>
                          No product image
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="eyebrow">
                        PRODUCT
                      </span>

                      <h2>
                        {
                          item.product_name
                        }
                      </h2>

                      <p>
                        Quantity:{' '}
                        <strong>
                          {
                            item.quantity
                          }
                        </strong>
                      </p>

                      <p>
                        Unit price:{' '}
                        <strong>
                          {money(
                            item.unit_price_pence
                          )}
                        </strong>
                      </p>

                      {item.product_slug && (
                        <p>
                          Product code:{' '}
                          <code>
                            {
                              item.product_slug
                            }
                          </code>
                        </p>
                      )}
                    </div>
                  </div>

                  {item.personalisation &&
                    typeof item.personalisation === 'object' &&
                    'printArtworkUrl' in item.personalisation &&
                    typeof item.personalisation.printArtworkUrl === 'string' &&
                    /^https:\/\//.test(item.personalisation.printArtworkUrl) && (
                      <div className="card" style={{ margin: '12px 0' }}>
                        <strong>Customer-uploaded card front artwork</strong>
                        <p>Use this file for the printed front of the card. The NFC memory photo is separate.</p>
                        <a
                          href={String(item.personalisation.printArtworkUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View print artwork
                        </a>
                      </div>
                    )}

                  {personalisation.length >
                    0 && (
                    <div className="smAdminPersonalisation">
                      <h3>
                        Personalisation
                      </h3>

                      <dl>
                        {personalisation.map(
                          ([
                            key,
                            value,
                          ]) => (
                            <div
                              key={
                                key
                              }
                            >
                              <dt>
                                {
                                  key
                                }
                              </dt>

                              <dd>
                                {displayValue(
                                  value
                                )}
                              </dd>
                            </div>
                          )
                        )}
                      </dl>
                    </div>
                  )}

                  <div className="smAdminProductionChecklist">
                    <span className="eyebrow">
                      PRODUCTION
                    </span>

                    <h3>
                      Production Checklist
                    </h3>

                    <form
                      action={
                        saveProductionChecklist
                      }
                    >
                      <input
                        type="hidden"
                        name="orderId"
                        value={
                          order.id
                        }
                      />

                      <input
                        type="hidden"
                        name="itemId"
                        value={
                          item.id
                        }
                      />

                      <label>
                        <input
                          type="checkbox"
                          name="blankSelected"
                          defaultChecked={
                            Boolean(
                              savedProduction.blankSelected
                            )
                          }
                        />

                        <span>
                          Product blank / material selected
                        </span>
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          name="designChecked"
                          defaultChecked={
                            Boolean(
                              savedProduction.designChecked
                            )
                          }
                        />

                        <span>
                          Personalisation and design checked
                        </span>
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          name="printPrepared"
                          defaultChecked={
                            Boolean(
                              savedProduction.printPrepared
                            )
                          }
                        />

                        <span>
                          Print / artwork prepared
                        </span>
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          name="printed"
                          defaultChecked={
                            Boolean(
                              savedProduction.printed
                            )
                          }
                        />

                        <span>
                          Product printed / finished
                        </span>
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          name="physicalQualityChecked"
                          defaultChecked={
                            Boolean(
                              savedProduction.physicalQualityChecked
                            )
                          }
                        />

                        <span>
                          Physical quality checked
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="btn"
                      >
                        Save Production Checklist
                      </button>
                    </form>
                  </div>

                  <div className="smAdminMemoryConnection">
                    <span className="eyebrow">
                      SMART MEMORY
                    </span>

                    {code ? (
                      memory ? (
                        <>
                          <div className="smAdminMemorySafety">
                            <strong>
                              Verify this pairing
                            </strong>

                            <span>
                              Order:{' '}
                              {
                                order.order_number
                              }
                            </span>

                            <span>
                              Product:{' '}
                              {
                                item.product_name
                              }
                            </span>

                            <span>
                              Recipient:{' '}
                              {
                                memory.recipient_name
                              }
                            </span>

                            <span>
                              Memory code:{' '}
                              <code>
                                {
                                  memory.code
                                }
                              </code>
                            </span>
                          </div>

                          <div className="smAdminMemoryContent">
                            {memory.photo_url && (
                              <img
                                src={
                                  memory.photo_url
                                }
                                alt={`Memory for ${memory.recipient_name}`}
                              />
                            )}

                            <div>
                              <h3>
                                Memory for{' '}
                                {
                                  memory.recipient_name
                                }
                              </h3>

                              <p>
                                From:{' '}
                                <strong>
                                  {memory.sender_name ||
                                    'Not provided'}
                                </strong>
                              </p>

                              <p>
                                Photo:{' '}
                                <strong>
                                  {memory.photo_url
                                    ? 'Yes'
                                    : 'No'}
                                </strong>
                              </p>

                              <p>
                                Voice:{' '}
                                <strong>
                                  {memory.audio_url
                                    ? 'Yes'
                                    : 'No'}
                                </strong>
                              </p>

                              <p>
                                Video:{' '}
                                <strong>
                                  {memory.video_url
                                    ? 'Yes'
                                    : 'No'}
                                </strong>
                              </p>

                              <p>
                                Message:{' '}
                                <strong>
                                  {memory.message
                                    ? 'Yes'
                                    : 'No'}
                                </strong>
                              </p>

                              {memory.message && (
                                <blockquote className="smAdminMemoryMessage">
                                  {
                                    memory.message
                                  }
                                </blockquote>
                              )}

                              {memory.audio_url && (
                                <audio
                                  controls
                                  preload="none"
                                  src={
                                    memory.audio_url
                                  }
                                />
                              )}

                              <div className="smAdminOrderActions">
                                <Link
                                  href={`/m/${memory.code}`}
                                  target="_blank"
                                  className="btn"
                                >
                                  View Recipient Experience
                                </Link>

                                <Link
                                  href={`/admin/memories`}
                                  className="btn secondary"
                                >
                                  All Memories
                                </Link>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="smAdminCriticalWarning">
                          <strong>
                            Memory link problem
                          </strong>

                          <p>
                            This item contains
                            memory code{' '}
                            <code>
                              {code}
                            </code>
                            , but no matching
                            memory record was
                            found. Do not
                            produce or program
                            NFC until reviewed.
                          </p>
                        </div>
                      )
                    ) : item.product_type ===
                      'traditional-card' ? (
                      <div className="card">
                        <p>
                          Traditional card -
                          no Smart Memory is
                          required.
                        </p>
                      </div>
                    ) : (
                      <div className="smAdminCriticalWarning">
                        <strong>
                          Smart Memory missing
                        </strong>

                        <p>
                          This physical item
                          does not currently
                          have a Smart Memory
                          code attached.
                        </p>
                      </div>
                    )}
                  </div>

                  {smartLink &&
                    memory && (
                    <div className="smAdminNfcPanel">
                      <div className="smAdminNfcHeading">
                        <div>
                          <span className="eyebrow">
                            NFC + QR
                          </span>

                          <h3>
                            Smart Memory Programming
                          </h3>

                          <p>
                            NFC and QR must both open
                            this exact Smart Memory.
                          </p>
                        </div>

                        <span className="smAdminMemoryCodeBadge">
                          {memory.code}
                        </span>
                      </div>

                      <div className="smAdminNfcGrid">
                        <div className="smAdminQrCard">
                          <img
                            className="smAdminQrImage"
                            src={
                              smartLink.qrDataUrl
                            }
                            alt={`QR code for memory ${memory.code}`}
                          />

                          <strong>
                            Production QR
                          </strong>

                          <small>
                            Scan with a phone before
                            attaching or dispatching.
                          </small>
                        </div>

                        <div className="smAdminNfcDetails">
                          <div className="smAdminNfcPairing">
                            <strong>
                              Confirm the physical pairing
                            </strong>

                            <span>
                              Order:{' '}
                              {order.order_number}
                            </span>

                            <span>
                              Product:{' '}
                              {item.product_name}
                            </span>

                            <span>
                              Recipient:{' '}
                              {memory.recipient_name}
                            </span>

                            <span>
                              Memory code:{' '}
                              <code>
                                {memory.code}
                              </code>
                            </span>
                          </div>

                          <div className="smAdminCanonicalUrl">
                            <span>
                              Exact URL for NFC + QR
                            </span>

                            <code>
                              {smartLink.url}
                            </code>
                          </div>

                          <div className="smAdminOrderActions">
                            <CopyMemoryUrlButton
                              url={
                                smartLink.url
                              }
                            />

                            <a
                              href={
                                smartLink.url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="btn secondary"
                            >
                              Test Exact URL
                            </a>
                          </div>

                          <form
                            action={
                              saveNfcChecks
                            }
                            className="smAdminNfcChecklist"
                          >
                            <input
                              type="hidden"
                              name="orderId"
                              value={
                                order.id
                              }
                            />

                            <input
                              type="hidden"
                              name="itemId"
                              value={
                                item.id
                              }
                            />

                            <label className="smAdminSafetyCheck">
                              <input
                                type="checkbox"
                                name="pairingVerified"
                                defaultChecked={
                                  Boolean(
                                    savedNfc.pairingVerified
                                  )
                                }
                              />

                              <span>
                                <strong>
                                  Pairing verified
                                </strong>

                                Order, physical product,
                                recipient and memory code
                                all match.
                              </span>
                            </label>

                            <label>
                              <input
                                type="checkbox"
                                name="programmed"
                                defaultChecked={
                                  Boolean(
                                    savedNfc.programmed
                                  )
                                }
                              />

                              <span>
                                NFC tag programmed with
                                the exact URL shown above
                              </span>
                            </label>

                            <label>
                              <input
                                type="checkbox"
                                name="tested"
                                defaultChecked={
                                  Boolean(
                                    savedNfc.tested
                                  )
                                }
                              />

                              <span>
                                NFC tag physically tested
                                with a phone
                              </span>
                            </label>

                            <label>
                              <input
                                type="checkbox"
                                name="qrTested"
                                defaultChecked={
                                  Boolean(
                                    savedQr.tested
                                  )
                                }
                              />

                              <span>
                                QR code scanned and opens
                                the same Smart Memory
                              </span>
                            </label>

                            <button
                              type="submit"
                              className="btn"
                            >
                              Save NFC / QR Checks
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="smAdminQualityPanel">
                    <span className="eyebrow">
                      FINAL QUALITY CONTROL
                    </span>

                    <h3>
                      Final Verification
                    </h3>

                    <p>
                      Complete this only after the physical
                      product, Smart Memory and NFC / QR
                      have been checked together.
                    </p>

                    <form
                      action={
                        saveQualityChecks
                      }
                      className="smAdminQualityChecklist"
                    >
                      <input
                        type="hidden"
                        name="orderId"
                        value={
                          order.id
                        }
                      />

                      <input
                        type="hidden"
                        name="itemId"
                        value={
                          item.id
                        }
                      />

                      <label>
                        <input
                          type="checkbox"
                          name="physicalProductChecked"
                          defaultChecked={
                            Boolean(
                              savedQuality.physicalProductChecked
                            )
                          }
                        />

                        <span>
                          Physical product matches this order
                        </span>
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          name="personalisationChecked"
                          defaultChecked={
                            Boolean(
                              savedQuality.personalisationChecked
                            )
                          }
                        />

                        <span>
                          Personalisation, image and design checked
                        </span>
                      </label>

                      {item.product_type !==
                        'traditional-card' && (
                        <>
                          <label>
                            <input
                              type="checkbox"
                              name="memoryExperienceChecked"
                              defaultChecked={
                                Boolean(
                                  savedQuality.memoryExperienceChecked
                                )
                              }
                            />

                            <span>
                              Smart Memory opened and content checked
                            </span>
                          </label>

                          <label className="smAdminSafetyCheck">
                            <input
                              type="checkbox"
                              name="finalPairingConfirmed"
                              defaultChecked={
                                Boolean(
                                  savedQuality.finalPairingConfirmed
                                )
                              }
                            />

                            <span>
                              <strong>
                                Final pairing confirmed
                              </strong>

                              Physical gift, recipient and memory
                              code all match.
                            </span>
                          </label>
                        </>
                      )}

                      <label>
                        <input
                          type="checkbox"
                          name="finalQualityApproved"
                          defaultChecked={
                            Boolean(
                              savedQuality.finalQualityApproved
                            )
                          }
                        />

                        <span>
                          Final physical quality approved
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="btn"
                      >
                        Save Quality Checks
                      </button>
                    </form>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>


      <section className="smAdminDetailSection">
        <span className="eyebrow">
          FINAL RELEASE
        </span>

        <h2>
          Ready to Dispatch Verification
        </h2>

        <div className="smAdminFinalGate">
          <div className="smAdminFinalGateHeader">
            <div>
              <h3>
                Production Release Check
              </h3>

              <p>
                Every physical item must pass
                production, Smart Memory / NFC
                checks and final quality control
                before release.
              </p>
            </div>

            <span
              className={
                allItemsReady
                  ? 'smAdminGateReady'
                  : 'smAdminGateBlocked'
              }
            >
              {allItemsReady
                ? 'READY'
                : 'CHECKS REQUIRED'}
            </span>
          </div>

          <div className="smAdminReadinessList">
            {readiness.map(
              (item) => (
                <div
                  key={
                    item.itemId
                  }
                  className="smAdminReadinessItem"
                >
                  <strong>
                    {
                      item.productName
                    }
                  </strong>

                  <span>
                    {item.productionReady
                      ? '\u2713'
                      : '\u25CB'}{' '}
                    Production
                  </span>

                  <span>
                    {item.smartReady
                      ? '\u2713'
                      : '\u25CB'}{' '}
                    NFC / QR
                  </span>

                  <span>
                    {item.qualityReady
                      ? '\u2713'
                      : '\u25CB'}{' '}
                    Quality
                  </span>
                </div>
              )
            )}
          </div>

          {productionStatus ===
            'ready_to_dispatch' ? (
            <div className="smAdminReleaseConfirmed">
              <strong>
                Order released for dispatch
              </strong>

              <span>
                All required production and
                Smart Memory checks passed.
              </span>
            </div>
          ) : (
            <form
              action={
                approveReadyToDispatch
              }
            >
              <input
                type="hidden"
                name="orderId"
                value={
                  order.id
                }
              />

              <button
                type="submit"
                className="btn"
                disabled={
                  !allItemsReady
                }
              >
                Approve Ready to Dispatch
              </button>

              {!allItemsReady && (
                <p>
                  Complete the missing checks
                  above before this order can
                  be released.
                </p>
              )}
            </form>
          )}
        </div>
      </section>

      <section className="smAdminDetailSection">
        <span className="eyebrow">
          DISPATCH
        </span>

        <h2>
          Dispatch & Tracking
        </h2>

        <div className="smAdminDispatchGrid">
          <form
            action={
              saveDispatchDetails
            }
            className="card smAdminDispatchForm"
          >
            <input
              type="hidden"
              name="orderId"
              value={
                order.id
              }
            />

            <label>
              <span>
                Carrier / delivery service
              </span>

              <input
                type="text"
                name="carrier"
                defaultValue={
                  dispatchData.carrier || ''
                }
                placeholder="Royal Mail, Evri, DPD..."
              />
            </label>

            <label>
              <span>
                Tracking number
              </span>

              <input
                type="text"
                name="trackingNumber"
                defaultValue={
                  dispatchData.trackingNumber || ''
                }
                placeholder="Optional"
              />
            </label>

            <label>
              <span>
                Dispatch note
              </span>

              <textarea
                name="dispatchNote"
                defaultValue={
                  dispatchData.note || ''
                }
                rows={4}
                placeholder="Packaging, delivery or fulfilment note"
              />
            </label>

            <button
              type="submit"
              className="btn secondary"
            >
              Save Dispatch Details
            </button>
          </form>

          <div className="card smAdminDispatchRelease">
            <span className="eyebrow">
              RELEASE
            </span>

            <h3>
              {productionStatus ===
                'dispatched'
                ? 'Dispatched'
                : 'Final Dispatch'}
            </h3>

            {productionStatus ===
              'dispatched' ? (
              <>
                <p>
                  This order has been
                  marked as dispatched.
                </p>

                {dispatchData.dispatchedAt && (
                  <p>
                    Dispatched:{' '}
                    <strong>
                      {formatDate(
                        dispatchData.dispatchedAt
                      )}
                    </strong>
                  </p>
                )}

                {dispatchData.dispatchedBy && (
                  <p>
                    By:{' '}
                    {
                      dispatchData.dispatchedBy
                    }
                  </p>
                )}

                <div className="smAdminDispatchEmailStatus">
                  <strong>
                    Customer email
                  </strong>

                  {dispatchData.dispatchEmailSentAt ? (
                    <>
                      <span className="smAdminEmailSent">
                        Sent
                      </span>

                      <small>
                        {formatDate(
                          dispatchData.dispatchEmailSentAt
                        )}
                      </small>
                    </>
                  ) : (
                    <>
                      <span className="smAdminEmailNotSent">
                        Not sent
                      </span>

                      {dispatchData.dispatchEmailError && (
                        <small>
                          {
                            dispatchData.dispatchEmailError
                          }
                        </small>
                      )}

                      <form
                        action={
                          sendOrderDispatchEmail
                        }
                      >
                        <input
                          type="hidden"
                          name="orderId"
                          value={
                            order.id
                          }
                        />

                        <button
                          type="submit"
                          className="btn secondary"
                        >
                          Send Dispatch Email
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </>
            ) : productionStatus ===
                'ready_to_dispatch' ? (
              <form
                action={
                  markOrderDispatched
                }
              >
                <input
                  type="hidden"
                  name="orderId"
                  value={
                    order.id
                  }
                />

                <p>
                  Final verification
                  has passed. Confirm
                  only after the physical
                  parcel has actually
                  left your control.
                </p>

                <button
                  type="submit"
                  className="btn"
                >
                  Mark as Dispatched
                </button>
              </form>
            ) : (
              <p>
                This order must be
                Ready to Dispatch before
                it can be marked as
                dispatched.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="smAdminDetailSection">
        <span className="eyebrow">
          INTERNAL ONLY
        </span>

        <h2>
          Production Notes
        </h2>

        <form
          action={
            addInternalOrderNote
          }
          className="card smAdminNoteForm"
        >
          <input
            type="hidden"
            name="orderId"
            value={
              order.id
            }
          />

          <textarea
            name="note"
            rows={4}
            maxLength={2000}
            placeholder="Add an internal production or fulfilment note..."
            required
          />

          <button
            type="submit"
            className="btn secondary"
          >
            Add Internal Note
          </button>
        </form>

        {internalNotes.length > 0 && (
          <div className="smAdminNotesList">
            {[...internalNotes]
              .reverse()
              .map(
                (
                  note,
                  index
                ) => (
                  <article
                    key={
                      note.id ||
                      index
                    }
                    className="smAdminNote"
                  >
                    <p>
                      {note.text}
                    </p>

                    <small>
                      {note.createdAt
                        ? formatDate(
                            note.createdAt
                          )
                        : ''}
                      {note.createdBy
                        ? ` - ${note.createdBy}`
                        : ''}
                    </small>
                  </article>
                )
              )}
          </div>
        )}
      </section>
      <section className="smAdminDetailSection">
        <span className="eyebrow">
          ORDER TOTAL
        </span>

        <h2>
          Financial Summary
        </h2>

        <div className="card smAdminTotals">
          <div>
            <span>
              Subtotal
            </span>

            <strong>
              {money(
                order.subtotal_pence
              )}
            </strong>
          </div>

          <div>
            <span>
              Delivery
            </span>

            <strong>
              {money(
                order.delivery_pence
              )}
            </strong>
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {money(
                order.total_pence
              )}
            </strong>
          </div>
        </div>
      </section>
    </section>
  );
}
