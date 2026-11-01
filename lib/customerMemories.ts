import {
  supabaseAdmin,
} from './supabaseAdmin';

import {
  products,
} from './products';

import {
  getProductExperience,
} from './productExperience';

export type ConnectedGift = {
  orderId: string;
  orderNumber: string;
  productSlug: string | null;
  productName: string;
  imageUrl: string | null;
  occasion: string | null;
  personalisation: unknown;
};

export type CustomerMemory = {
  code: string;
  recipient: string;
  message: string | null;
  sender: string | null;
  createdAt: string;
  photoUrl: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
  connectedGifts: ConnectedGift[];
};

type RawMemory = {
  code: string;
  customer_id: string | null;
  recipient_name: string;
  message: string | null;
  sender_name: string | null;
  created_at: string;
  photo_url: string | null;
  audio_url: string | null;
  video_url: string | null;
};

type RawOrderItem = {
  product_slug: string | null;
  product_name: string | null;
  memory_code: string | null;
  image_url: string | null;
  personalisation: unknown;
};

type RawOrder = {
  id: string;
  order_number: string;
  created_at: string;
  order_items:
    | RawOrderItem[]
    | null;
};

function getOccasion(
  value: unknown
) {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return null;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  return typeof record.occasion ===
    'string'
    ? record.occasion
    : null;
}

function getCustomerProductName(
  slug: string | null,
  fallback:
    | string
    | null
) {
  if (!slug) {
    return (
      fallback ||
      'Smart Memory Gift'
    );
  }

  const known =
    products.some(
      (product) =>
        product.slug ===
        slug
    );

  if (!known) {
    return (
      fallback ||
      'Smart Memory Gift'
    );
  }

  return getProductExperience(
    slug
  ).marketingName;
}

async function getOwnedOrders(
  userId: string
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
        `
          id,
          order_number,
          created_at,
          order_items (
            product_slug,
            product_name,
            memory_code,
            image_url,
            personalisation
          )
        `
      )
      .eq(
        'customer_id',
        userId
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

  if (error) {
    throw error;
  }

  return (
    (data || []) as unknown as RawOrder[]
  );
}

function buildGiftMap(
  orders: RawOrder[]
) {
  const map =
    new Map<
      string,
      ConnectedGift[]
    >();

  orders.forEach(
    (order) => {
      const items =
        Array.isArray(
          order.order_items
        )
          ? order.order_items
          : [];

      items.forEach(
        (item) => {
          const code =
            item.memory_code
              ?.trim()
              .toUpperCase();

          if (!code) {
            return;
          }

          const gift:
            ConnectedGift = {
            orderId:
              order.id,

            orderNumber:
              order.order_number,

            productSlug:
              item.product_slug,

            productName:
              getCustomerProductName(
                item.product_slug,
                item.product_name
              ),

            imageUrl:
              item.image_url,

            occasion:
              getOccasion(
                item.personalisation
              ),

            personalisation:
              item.personalisation,
          };

          const existing =
            map.get(code) ||
            [];

          existing.push(
            gift
          );

          map.set(
            code,
            existing
          );
        }
      );
    }
  );

  return map;
}

function convertMemory(
  memory: RawMemory,
  giftMap: Map<
    string,
    ConnectedGift[]
  >
): CustomerMemory {
  return {
    code:
      memory.code,

    recipient:
      memory.recipient_name,

    message:
      memory.message,

    sender:
      memory.sender_name,

    createdAt:
      memory.created_at,

    photoUrl:
      memory.photo_url,

    audioUrl:
      memory.audio_url,

    videoUrl:
      memory.video_url,

    connectedGifts:
      giftMap.get(
        memory.code
      ) || [],
  };
}

export async function getCustomerMemories(
  userId: string
): Promise<CustomerMemory[]> {
  const admin =
    supabaseAdmin();

  const orders =
    await getOwnedOrders(
      userId
    );

  const giftMap =
    buildGiftMap(
      orders
    );

  const {
    data:
      directData,
    error:
      directError,
  } =
    await admin
      .from('memories')
      .select(
        `
          code,
          customer_id,
          recipient_name,
          message,
          sender_name,
          created_at,
          photo_url,
          audio_url,
          video_url
        `
      )
      .eq(
        'customer_id',
        userId
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

  if (directError) {
    throw directError;
  }

  const direct =
    (directData ||
      []) as RawMemory[];

  /*
   * Backward compatibility:
   *
   * Memories created before
   * customer_id was attached
   * can still belong to this
   * customer through their
   * existing order_items.memory_code.
   */
  const directCodes =
    new Set(
      direct.map(
        (memory) =>
          memory.code
      )
    );

  const legacyCodes =
    Array.from(
      giftMap.keys()
    ).filter(
      (code) =>
        !directCodes.has(
          code
        )
    );

  let legacy:
    RawMemory[] = [];

  if (
    legacyCodes.length >
    0
  ) {
    const {
      data,
      error,
    } =
      await admin
        .from('memories')
        .select(
          `
            code,
            customer_id,
            recipient_name,
            message,
            sender_name,
            created_at,
            photo_url,
            audio_url,
            video_url
          `
        )
        .in(
          'code',
          legacyCodes
        );

    if (error) {
      throw error;
    }

    legacy =
      (data ||
        []) as RawMemory[];
  }

  const memories =
    [
      ...direct,
      ...legacy,
    ]
      .filter(
        (
          memory,
          index,
          all
        ) =>
          all.findIndex(
            (item) =>
              item.code ===
              memory.code
          ) === index
      )
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      );

  return memories.map(
    (memory) =>
      convertMemory(
        memory,
        giftMap
      )
  );
}

export async function getCustomerMemoryByCode(
  userId: string,
  code: string
): Promise<CustomerMemory | null> {
  const normalized =
    code
      .trim()
      .toUpperCase();

  if (
    !/^[A-Z2-9]{8}$/.test(
      normalized
    )
  ) {
    return null;
  }

  const admin =
    supabaseAdmin();

  const {
    data,
    error,
  } =
    await admin
      .from('memories')
      .select(
        `
          code,
          customer_id,
          recipient_name,
          message,
          sender_name,
          created_at,
          photo_url,
          audio_url,
          video_url
        `
      )
      .eq(
        'code',
        normalized
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const memory =
    data as RawMemory;

  const orders =
    await getOwnedOrders(
      userId
    );

  const giftMap =
    buildGiftMap(
      orders
    );

  const ownedDirectly =
    memory.customer_id ===
    userId;

  const ownedThroughOrder =
    giftMap.has(
      normalized
    );

  if (
    !ownedDirectly &&
    !ownedThroughOrder
  ) {
    return null;
  }

  return convertMemory(
    memory,
    giftMap
  );
}