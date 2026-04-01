import { PageViewTracker } from "@/components/PageViewTracker";
import { VercelWebAnalytics } from "@/components/VercelWebAnalytics";
import * as P from "@/routes/lazyPages";
import { PageSpinner } from "@/routes/PageSpinner";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

export function AppRoutes(): JSX.Element {
  return (
    <>
      {/* Outside Suspense so views record while lazy route chunks load */}
      <PageViewTracker />
      <VercelWebAnalytics />
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route element={<P.PublicSiteGate />}>
            <Route path="/" element={<P.HomePage />} />
            <Route path="/about" element={<P.AboutPage />} />
            <Route path="/projects/:id" element={<P.ProjectDetailPage />} />
            <Route path="/projects" element={<P.ProjectsPage />} />
            <Route path="/services" element={<P.ServicesPage />} />
            <Route path="/blogs" element={<P.BlogsPage />} />
            <Route path="/blogs/:slug" element={<P.BlogPostPage />} />
            <Route path="/contact" element={<P.ContactPage />} />
            <Route path="*" element={<P.NotFoundPage />} />
          </Route>
          <Route path="/admin/login" element={<P.AdminLoginPage />} />
          <Route path="/admin" element={<P.AdminProtectedLayout />}>
            <Route index element={<P.AdminDashboardPage />} />
            <Route path="projects" element={<P.AdminProjectsListPage />}>
              <Route path="new" element={<P.AdminProjectFormPage />} />
              <Route path=":id" element={<P.AdminProjectFormPage />} />
            </Route>
            <Route path="testimonials" element={<P.AdminTestimonialsPage />} />
            <Route path="blog" element={<P.AdminBlogListPage />}>
              <Route path="new" element={<P.AdminBlogFormPage />} />
              <Route path=":id" element={<P.AdminBlogFormPage />} />
            </Route>
            <Route path="inbox" element={<P.AdminInboxPage />} />
            <Route path="analytics" element={<P.AdminAnalyticsPage />} />
            <Route path="media" element={<P.AdminMediaLibraryPage />} />
            <Route path="settings" element={<P.AdminSiteSettingsPage />} />
            <Route
              path="settings/social"
              element={<P.AdminSocialLinksPage />}
            />
            <Route path="settings/seo" element={<P.AdminSEOPage />} />
            <Route path="settings/resume" element={<P.AdminResumePage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
