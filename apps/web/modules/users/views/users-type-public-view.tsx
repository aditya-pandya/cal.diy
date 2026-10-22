"use client";

import { getBookerWrapperClasses } from "@calcom/features/bookings/Booker/utils/getBookerWrapperClasses";
import { BookerWebWrapper as Booker } from "@calcom/web/modules/bookings/components/BookerWebWrapper";
import BookingPageErrorBoundary from "@components/error/BookingPageErrorBoundary";
import type { inferSSRProps } from "@lib/types/inferSSRProps";
import type { getServerSideProps } from "@server/lib/[user]/[type]/getServerSideProps";
import type { EmbedProps } from "app/WithEmbedSSR";
import { useSearchParams } from "next/navigation";

export type PageProps = inferSSRProps<typeof getServerSideProps> & EmbedProps;

export const getMultipleDurationValue = (
  multipleDurationConfig: number[] | undefined,
  queryDuration: string | string[] | null | undefined,
  defaultValue: number
) => {
  if (!multipleDurationConfig) return null;
  if (multipleDurationConfig.includes(Number(queryDuration))) return Number(queryDuration);
  return defaultValue;
};

function Type({ slug, user, isEmbed, booking, isBrandingHidden, eventData, orgBannerUrl }: PageProps) {
  const searchParams = useSearchParams();

  return (
    <BookingPageErrorBoundary>
      {!isEmbed ? (
        <div className="ap-booking">
          <header className="ap-bar">
            <a href="https://aditya.pandya.co" className="ap-me">
              <svg viewBox="0 0 22 12" aria-hidden="true">
                <path d="M1.2 4.6 C4.6 1.4 8.4 2.2 11 7.6 C13.4 2.6 17.2 1.2 20.8 3.8" />
              </svg>
              <span>Aditya Pandya</span>
            </a>
            <a href="https://aditya.pandya.co" className="ap-back">
              Back to the site
            </a>
          </header>
          <div className="ap-hero">
            <h1>
              {"Let’s "}
              <span className="ap-c2">t</span>
              {"alk."}
            </h1>
          </div>
          <main className="ap-stage">
            <Booker
              username={user}
              eventSlug={slug}
              bookingData={booking}
              hideBranding={isBrandingHidden}
              eventData={eventData}
              entity={{ ...eventData.entity, eventTypeId: eventData?.id }}
              durationConfig={eventData.metadata?.multipleDuration}
              orgBannerUrl={orgBannerUrl}
              duration={getMultipleDurationValue(
                eventData.metadata?.multipleDuration,
                searchParams?.get("duration"),
                eventData.length
              )}
            />
          </main>
        </div>
      ) : (
        <main className={getBookerWrapperClasses({ isEmbed: true })}>
          <Booker
            username={user}
            eventSlug={slug}
            bookingData={booking}
            hideBranding={isBrandingHidden}
            eventData={eventData}
            entity={{ ...eventData.entity, eventTypeId: eventData?.id }}
            durationConfig={eventData.metadata?.multipleDuration}
            orgBannerUrl={orgBannerUrl}
            duration={getMultipleDurationValue(
              eventData.metadata?.multipleDuration,
              searchParams?.get("duration"),
              eventData.length
            )}
          />
        </main>
      )}
    </BookingPageErrorBoundary>
  );
}

export default Type;
