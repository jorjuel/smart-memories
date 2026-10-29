'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function PersonaliseCardContent() {
  const searchParams = useSearchParams();

  const occasion = searchParams.get('occasion') || 'Birthday';
  const design = searchParams.get('design') || 'Floral Keepsake';

  const [cardType, setCardType] = useState<'traditional' | 'smart'>('smart');
  const [recipient, setRecipient] = useState('');

  const [frontGreeting, setFrontGreeting] = useState(
    occasion === 'Birthday' ? 'Happy Birthday' : `Happy ${occasion}`
  );

  const [insideMessage, setInsideMessage] = useState(
    'Wishing you a very special day filled with wonderful memories.'
  );

  const [sender, setSender] = useState('');
  const [colour, setColour] = useState('Rose');
  const [includePhoto, setIncludePhoto] = useState(true);

  /* =========================================================
     VOICE RECORDING
     ========================================================= */

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(
    null
  );
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(
    null
  );
  const [audioError, setAudioError] = useState<string | null>(null);

  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(
    null
  );
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(
    null
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const price = useMemo(() => {
    let total = 6.95;

    if (cardType === 'smart') total += 5;
    if (includePhoto) total += 1.5;

    return total.toFixed(2);
  }, [cardType, includePhoto]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }

      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }
    };
  }, [recordedAudioUrl, uploadedAudioUrl]);

  function getSupportedAudioMimeType() {
    if (typeof MediaRecorder === 'undefined') {
      return '';
    }

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];

    return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  }

  async function startRecording() {
    setAudioError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setAudioError(
        'Voice recording is not supported by this browser. Please upload an audio file instead.'
      );
      return;
    }

    try {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }

      setRecordedAudioUrl(null);
      setRecordedAudioBlob(null);

      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }

      setUploadedAudioUrl(null);
      setUploadedAudioFile(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaStreamRef.current = stream;

      const mimeType = getSupportedAudioMimeType();

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalType =
          recorder.mimeType ||
          audioChunksRef.current[0]?.type ||
          'audio/webm';

        const audioBlob = new Blob(audioChunksRef.current, {
          type: finalType,
        });

        const audioUrl = URL.createObjectURL(audioBlob);

        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);

        if (mediaStreamRef.current) {
          mediaStreamRef.current
            .getTracks()
            .forEach((track) => track.stop());
        }

        mediaStreamRef.current = null;
      };

      recorder.start();

      setRecordingSeconds(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);
    } catch (error) {
      console.error(error);

      setAudioError(
        'Microphone access was not available. Please allow microphone permission in your browser and try again.'
      );
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function deleteRecording() {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setRecordingSeconds(0);
    setAudioError(null);
  }

  function handleAudioUpload(file: File | null) {
    if (!file) return;

    setAudioError(null);

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setRecordingSeconds(0);

    if (uploadedAudioUrl) {
      URL.revokeObjectURL(uploadedAudioUrl);
    }

    setUploadedAudioFile(file);
    setUploadedAudioUrl(URL.createObjectURL(file));
  }

  return (
    <>
      <section className="personaliseHeader">
        <Link href="/cards" className="personaliseBack">
          ← Back to card designs
        </Link>

        <span className="v14Eyebrow">PERSONALISE YOUR CARD</span>

        <h1>Make it theirs.</h1>

        <p>
          You selected <strong>{design}</strong> for{' '}
          <strong>{occasion}</strong>.
        </p>
      </section>

      <section className="personaliseLayout">
        <div className="personaliseControls">
          <div className="personaliseBlock">
            <span className="personaliseStep">01</span>

            <h2>Choose your card</h2>

            <p>
              Keep it beautifully traditional or add the Smart Memories
              experience.
            </p>

            <div className="cardTypeChoices">
              <button
                type="button"
                className={cardType === 'traditional' ? 'active' : ''}
                onClick={() => setCardType('traditional')}
              >
                <strong>Traditional Card</strong>
                <span>Handcrafted and personalised</span>
                <b>From £6.95</b>
              </button>

              <button
                type="button"
                className={cardType === 'smart' ? 'active smart' : ''}
                onClick={() => setCardType('smart')}
              >
                <div className="recommendedBadge">MOST SPECIAL</div>
                <strong>Smart Memory Card</strong>
                <span>Card + NFC/QR digital memory</span>
                <b>From £11.95</b>
              </button>
            </div>
          </div>

          <div className="personaliseBlock">
            <span className="personaliseStep">02</span>

            <h2>Personalise the words</h2>

            <label className="personaliseField">
              <span>Recipient name</span>
              <input
                type="text"
                placeholder="e.g. Mum, Sarah, Grandad..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </label>

            <label className="personaliseField">
              <span>Front greeting</span>
              <input
                type="text"
                value={frontGreeting}
                onChange={(e) => setFrontGreeting(e.target.value)}
              />
            </label>

            <label className="personaliseField">
              <span>Inside message</span>
              <textarea
                rows={6}
                value={insideMessage}
                onChange={(e) => setInsideMessage(e.target.value)}
              />
            </label>

            <label className="personaliseField">
              <span>From</span>
              <input
                type="text"
                placeholder="Your name"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />
            </label>
          </div>

          <div className="personaliseBlock">
            <span className="personaliseStep">03</span>

            <h2>Choose the finishing style</h2>

            <div className="colourChoices">
              {['Rose', 'Plum', 'Cream', 'Sage', 'Blue', 'Gold'].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={colour === item ? 'active' : ''}
                    onClick={() => setColour(item)}
                  >
                    <span
                      className={`colourDot ${item.toLowerCase()}`}
                    ></span>
                    {item}
                  </button>
                )
              )}
            </div>

            <label className="photoOption">
              <input
                type="checkbox"
                checked={includePhoto}
                onChange={(e) => setIncludePhoto(e.target.checked)}
              />

              <span>
                <strong>Add a printed photograph</strong>
                <small>
                  Include a favourite photograph in the card design. +£1.50
                </small>
              </span>
            </label>
          </div>

          {cardType === 'smart' && (
            <div className="personaliseBlock smartMemoryBuilder">
              <span className="personaliseStep">04</span>

              <div className="smartBuilderTitle">
                <div>
                  <span className="v14Eyebrow">SMART MEMORY</span>
                  <h2>Add the part they can hear.</h2>
                </div>

                <span className="nfcBadge">NFC + QR</span>
              </div>

              <p>
                Your card will contain a discreet Smart Memories point.
                When the recipient taps it with their phone, their private
                memory page opens.
              </p>

              <div className="smartMemoryOptions">
                <div>
                  <span className="memoryOptionIcon">PHOTO</span>

                  <strong>Memory photograph</strong>

                  <small>
                    Upload the photograph they will see when they tap.
                  </small>

                  <input type="file" accept="image/*" />
                </div>

                <div className="voiceRecorderCard">
                  <span className="memoryOptionIcon">VOICE</span>

                  <strong>Voice message</strong>

                  <small>
                    Record your message now, or upload an audio file.
                  </small>

                  {!isRecording &&
                    !recordedAudioUrl &&
                    !uploadedAudioUrl && (
                      <button
                        type="button"
                        className="voiceRecordButton"
                        onClick={startRecording}
                      >
                        🎙 Record my voice
                      </button>
                    )}

                  {isRecording && (
                    <div className="recordingLive">
                      <div className="recordingStatus">
                        <span className="recordingDot"></span>

                        <strong>Recording</strong>

                        <span>
                          {formatTime(recordingSeconds)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="voiceStopButton"
                        onClick={stopRecording}
                      >
                        ■ Stop recording
                      </button>
                    </div>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <div className="recordingPreview">
                      <strong>Your recording is ready</strong>

                      <span>
                        Duration: {formatTime(recordingSeconds)}
                      </span>

                      <audio
                        controls
                        preload="metadata"
                        src={recordedAudioUrl}
                      />

                      <div className="recordingActions">
                        <button
                          type="button"
                          onClick={deleteRecording}
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            deleteRecording();
                            setTimeout(startRecording, 50);
                          }}
                        >
                          Record again
                        </button>
                      </div>
                    </div>
                  )}

                  {uploadedAudioUrl && (
                    <div className="recordingPreview">
                      <strong>Uploaded audio</strong>

                      <span>{uploadedAudioFile?.name}</span>

                      <audio
                        controls
                        preload="metadata"
                        src={uploadedAudioUrl}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (uploadedAudioUrl) {
                            URL.revokeObjectURL(uploadedAudioUrl);
                          }

                          setUploadedAudioUrl(null);
                          setUploadedAudioFile(null);
                        }}
                      >
                        Remove uploaded audio
                      </button>
                    </div>
                  )}

                  {!isRecording &&
                    !recordedAudioUrl &&
                    !uploadedAudioUrl && (
                      <>
                        <div className="voiceDivider">
                          <span>OR</span>
                        </div>

                        <label className="voiceUploadOption">
                          <span>Upload an existing recording</span>

                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(event) =>
                              handleAudioUpload(
                                event.target.files?.[0] || null
                              )
                            }
                          />
                        </label>
                      </>
                    )}

                  {audioError && (
                    <p className="voiceError">{audioError}</p>
                  )}
                </div>
              </div>

              <div className="smartPrivacyNote">
                <strong>
                  Your memory is separate from the printed card.
                </strong>

                <p>
                  The NFC chip contains only the Smart Memories link.
                  Your photograph and voice message are stored digitally.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="personalisePreview">
          <div className="previewSticky">
            <div className="previewHeading">
              <span>LIVE PREVIEW</span>
              <small>{design}</small>
            </div>

            <div
              className={`liveCardPreview colour-${colour.toLowerCase()}`}
            >
              <div className="liveCardDecoration">♥</div>

              <small>{occasion.toUpperCase()}</small>

              {recipient && (
                <span className="previewRecipient">
                  FOR {recipient}
                </span>
              )}

              <h2>{frontGreeting || 'Your greeting'}</h2>

              <p>Made especially for you</p>

              {cardType === 'smart' && (
                <div className="previewSmartMark">
                  <strong>♥ SMART MEMORY</strong>
                  <span>Tap to hear your message</span>
                </div>
              )}
            </div>

            <div className="insidePreview">
              <span>INSIDE YOUR CARD</span>

              <p>
                {insideMessage ||
                  'Your personal message will appear here.'}
              </p>

              {sender && (
                <strong>With love, {sender}</strong>
              )}
            </div>

            <div className="orderSummary">
              <div>
                <span>
                  {cardType === 'smart'
                    ? 'Smart Memory Card'
                    : 'Traditional Card'}
                </span>

                <strong>
                  £{cardType === 'smart' ? '11.95' : '6.95'}
                </strong>
              </div>

              {includePhoto && (
                <div>
                  <span>Printed photograph</span>
                  <strong>£1.50</strong>
                </div>
              )}

              <div className="orderTotal">
                <span>Total</span>
                <strong>£{price}</strong>
              </div>
            </div>

            <button
              type="button"
              className="personaliseBasketButton"
            >
              Add personalised card to basket
            </button>

            <p className="basketSmallPrint">
              We will review your personalisation before production.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}

export default function PersonaliseCardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: '100px 30px',
            textAlign: 'center',
          }}
        >
          Loading your card...
        </div>
      }
    >
      <PersonaliseCardContent />
    </Suspense>
  );
}