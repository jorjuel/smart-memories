type Props = {
  message?: string | null;
  sender?: string | null;
  variant?:
    | 'full'
    | 'compact';
};

export default function MemoryMessage({
  message,
  sender,
  variant = 'full',
}: Props) {
  const text =
    message?.trim();

  if (!text && !sender?.trim()) {
    return null;
  }

  // Never render an empty written-message section when there is no text.
  // A signature can stand on its own if a sender was provided.
  if (!text && sender?.trim()) {
    return variant === 'compact'
      ? null
      : (
        <p className="smRecipientSender">
          With love from <strong>{sender.trim()}</strong>
        </p>
      );
  }

  if (
    variant ===
    'compact'
  ) {
    return (
      <>
        {text && (
          <p className="smRecipientMessageCompact">
            {text}
          </p>
        )}
      </>
    );
  }

  return (
    <section className="smRecipientSection smRecipientMessageSection">
      <span className="smRecipientSectionLabel">
        WORDS
      </span>

      <h2>
        A few words for you
      </h2>

      {text && (
        <p className="smRecipientStoryText">
          {text}
        </p>
      )}

      {sender && (
        <p className="smRecipientSender">
          With love from{' '}
          <strong>
            {sender}
          </strong>
        </p>
      )}
    </section>
  );
}