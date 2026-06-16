"use client";

import type { EmbedProps } from "app/WithEmbedSSR";
import { useSearchParams } from "next/navigation";

import { BookerWebWrapper as Booker } from "@calcom/web/modules/bookings/components/BookerWebWrapper";
import { getBookerWrapperClasses } from "@calcom/features/bookings/Booker/utils/getBookerWrapperClasses";

import type { inferSSRProps } from "@lib/types/inferSSRProps";

import BookingPageErrorBoundary from "@components/error/BookingPageErrorBoundary";

import type { getServerSideProps } from "@server/lib/[user]/[type]/getServerSideProps";

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
        <div className="flex h-screen flex-col">
          <header className="flex shrink-0 items-center px-10 py-[18px]">
            <a
              href="https://aditya.pandya.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-default hover:text-emphasis transition-colors duration-300">
              Aditya Pandya
            </a>
          </header>
          <main className="flex flex-1 items-center justify-center overflow-auto">
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
