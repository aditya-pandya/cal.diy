import { loadTranslations } from "@calcom/i18n/server";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { buildLegacyCtx, decodeParams } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@server/lib/[user]/[type]/getServerSideProps";
import type { PageProps, Params, SearchParams } from "app/_types";
import { generateMeetingMetadata } from "app/_utils";
import { CustomI18nProvider } from "app/CustomI18nProvider";
import { withAppDirSsr } from "app/WithAppDirSsr";
import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import type React from "react";
import { cache } from "react";
import type { PageProps as LegacyPageProps } from "~/users/views/users-type-public-view";
import LegacyPage from "~/users/views/users-type-public-view";

const SHARE_CARD = {
  url: "https://aditya.pandya.co/assets/images/og-card.png?v=20261012",
  width: 1200,
  height: 627,
  alt: "Aditya Pandya",
};

const getData: (ctx: ReturnType<typeof buildLegacyCtx>) => Promise<LegacyPageProps> =
  withAppDirSsr<LegacyPageProps>(getServerSideProps);

// generateMetadata and the page both need these props. Keyed by strings because cache() compares
// arguments by identity, so one request runs getServerSideProps (about ten queries) once, not twice.
const getPageProps = cache(
  async (paramsKey: string, searchParamsKey: string): Promise<LegacyPageProps> =>
    getData(
      buildLegacyCtx(
        await headers(),
        await cookies(),
        JSON.parse(paramsKey) as Params,
        JSON.parse(searchParamsKey) as SearchParams
      )
    )
);
const propsFor = async ({ params, searchParams }: PageProps) =>
  getPageProps(JSON.stringify(await params), JSON.stringify(await searchParams));

const ServerPage = async ({ params, searchParams }: PageProps): Promise<JSX.Element> => {
  const props = await propsFor({ params, searchParams });

  const locale = props.eventData?.interfaceLanguage;
  if (locale) {
    const ns = "common";
    const translations = await loadTranslations(locale, ns);
    return (
      <CustomI18nProvider translations={translations} locale={locale} ns={ns}>
        <LegacyPage {...props} />
      </CustomI18nProvider>
    );
  }

  return <LegacyPage {...props} />;
};

export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  const props = await propsFor({ params, searchParams });

  const { booking, isSEOIndexable = true, eventData, isBrandingHidden } = props;
  const rescheduleUid = booking?.uid;
  const profileName = eventData?.profile?.name ?? "";
  const title = eventData?.title ?? "";
  const meeting = {
    title,
    profile: { name: profileName, image: eventData?.profile.image },
    users:
      eventData?.subsetOfUsers.map((user) => ({
        name: `${user.name}`,
        username: `${user.username}`,
      })) || [],
  };
  const decodedParams = decodeParams(await params);
  const metadata = await generateMeetingMetadata(
    meeting,
    (t) =>
      [rescheduleUid && !!booking ? t("reschedule") : "", `${title} | ${profileName}`]
        .filter(Boolean)
        .join(" "),
    (t) => [rescheduleUid ? t("reschedule") : "", title].filter(Boolean).join(" "),
    isBrandingHidden,
    WEBAPP_URL,
    `/${decodedParams.user}/${decodedParams.type}`
  );

  return {
    ...metadata,
    // The generated meeting image goes through the image optimizer, which this deployment turns off
    // (images.unoptimized), so it answered 400; aditya.pandya.co's own card is used instead.
    openGraph: { ...metadata.openGraph, images: [SHARE_CARD] },
    twitter: { card: "summary_large_image", images: [SHARE_CARD.url] },
    robots: {
      follow: !(eventData?.hidden || !isSEOIndexable),
      index: !(eventData?.hidden || !isSEOIndexable),
    },
  };
};

// The page is the golden field of aditya.pandya.co, so the browser bar matches it.
export const viewport: Viewport = {
  themeColor: "#ff7b1c",
};

export default ServerPage;
