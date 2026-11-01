type WizardStep = {
  key: string;
  label: string;
};

export default function PersonaliserProgress({
  steps,
  currentIndex,
}: {
  steps: WizardStep[];
  currentIndex: number;
}) {
  const progress =
    steps.length > 0
      ? ((currentIndex + 1) /
          steps.length) *
        100
      : 0;

  return (
    <div
      className="smWizardProgress"
      aria-label={`Step ${
        currentIndex + 1
      } of ${steps.length}`}
    >
      <div className="smWizardDesktopSteps">
        {steps.map(
          (step, index) => (
            <div
              key={step.key}
              className={
                index ===
                currentIndex
                  ? 'active'
                  : index <
                      currentIndex
                    ? 'complete'
                    : ''
              }
            >
              <span>
                {index + 1}
              </span>

              <strong>
                {step.label}
              </strong>
            </div>
          )
        )}
      </div>

      <div className="smWizardMobileProgress">
        <div>
          <strong>
            Step{' '}
            {currentIndex + 1}{' '}
            of {steps.length}
          </strong>

          <span>
            {
              steps[
                currentIndex
              ]?.label
            }
          </span>
        </div>

        <div className="smWizardProgressTrack">
          <span
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}