import MemoryAudio from './recipient/MemoryAudio';
import MemoryMessage from './recipient/MemoryMessage';

type Props = {
  recipient: string;
  message: string;
  sender: string;
  occasion?: string;
  photoUrl?: string;
  audioUrl?: string;
};

export default function SmartMemoryLivePreview({
  recipient,
  message,
  sender,
  occasion,
  photoUrl,
  audioUrl,
}: Props) {
  return (
    <div className="smLiveMemoryPhone">
      <div className="smLiveMemoryPhoneTop">
        <span />
      </div>

      <div className="smLiveMemoryScreen">
        <small>
          SMART MEMORY PREVIEW
        </small>

        {occasion && (
          <span className="smLiveMemoryOccasion">
            {occasion}
          </span>
        )}

        <span className="smLiveMemoryFor">
          MEMORY FOR
        </span>

        <h3>
          {recipient ||
            'Recipient name'}
        </h3>

        {photoUrl ? (
          <img
            src={photoUrl}
            alt={
              recipient
                ? `Memory for ${recipient}`
                : 'Your Smart Memory photo'
            }
          />
        ) : (
          <div className="smLiveMemoryEmptyPhoto">
            <span>
              Your main photo
              will appear here
            </span>
          </div>
        )}

        <div className="smLiveMemoryCard">
          <MemoryMessage
            message={
              message ||
              'Your personal message will appear here.'
            }
            variant="compact"
          />

          {audioUrl ? (
            <MemoryAudio
              src={
                audioUrl
              }
              variant="compact"
            />
          ) : (
            <div className="smLiveMemoryNoVoice">
              Voice message
              not added
            </div>
          )}

          {sender && (
            <span>
              With love always,{' '}
              <strong>
                {sender}
              </strong>{' '}
              ♡
            </span>
          )}
        </div>

        <small className="smLiveMemoryNote">
          Live preview using
          your current
          personalisation.
        </small>
      </div>
    </div>
  );
}