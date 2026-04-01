import { lazy } from "react";

export const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage })),
);
export const AboutPage = lazy(() =>
  import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
export const ProjectsPage = lazy(() =>
  import("@/pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage })),
);
export const ProjectDetailPage = lazy(() =>
  import("@/pages/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
export const ServicesPage = lazy(() =>
  import("@/pages/ServicesPage").then((m) => ({ default: m.ServicesPage })),
);
export const ContactPage = lazy(() =>
  import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
export const BlogsPage = lazy(() =>
  import("@/pages/BlogsPage").then((m) => ({ default: m.BlogsPage })),
);
export const BlogPostPage = lazy(() =>
  import("@/pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage })),
);
export const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
export const PublicSiteGate = lazy(() =>
  import("@/routes/PublicSiteGate").then((m) => ({ default: m.PublicSiteGate })),
);

export const AdminLoginPage = lazy(() =>
  import("@/admin/pages/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);
export const AdminProtectedLayout = lazy(() =>
  import("@/admin/components/AdminProtectedLayout").then((m) => ({
    default: m.AdminProtectedLayout,
  })),
);
export const AdminDashboardPage = lazy(() =>
  import("@/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
export const AdminProjectsListPage = lazy(() =>
  import("@/admin/pages/AdminProjectsListPage").then((m) => ({
    default: m.AdminProjectsListPage,
  })),
);
export const AdminProjectFormPage = lazy(() =>
  import("@/admin/pages/AdminProjectFormPage").then((m) => ({
    default: m.AdminProjectFormPage,
  })),
);
export const AdminTestimonialsPage = lazy(() =>
  import("@/admin/pages/AdminTestimonialsPage").then((m) => ({
    default: m.AdminTestimonialsPage,
  })),
);
export const AdminBlogListPage = lazy(() =>
  import("@/admin/pages/AdminBlogListPage").then((m) => ({
    default: m.AdminBlogListPage,
  })),
);
export const AdminBlogFormPage = lazy(() =>
  import("@/admin/pages/AdminBlogFormPage").then((m) => ({
    default: m.AdminBlogFormPage,
  })),
);
export const AdminInboxPage = lazy(() =>
  import("@/admin/pages/AdminInboxPage").then((m) => ({
    default: m.AdminInboxPage,
  })),
);
export const AdminAnalyticsPage = lazy(() =>
  import("@/admin/pages/AdminAnalyticsPage").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);
export const AdminMediaLibraryPage = lazy(() =>
  import("@/admin/pages/AdminMediaLibraryPage").then((m) => ({
    default: m.AdminMediaLibraryPage,
  })),
);
export const AdminSiteSettingsPage = lazy(() =>
  import("@/admin/pages/AdminSiteSettingsPage").then((m) => ({
    default: m.AdminSiteSettingsPage,
  })),
);
export const AdminSocialLinksPage = lazy(() =>
  import("@/admin/pages/AdminSocialLinksPage").then((m) => ({
    default: m.AdminSocialLinksPage,
  })),
);
export const AdminSEOPage = lazy(() =>
  import("@/admin/pages/AdminSEOPage").then((m) => ({
    default: m.AdminSEOPage,
  })),
);
export const AdminResumePage = lazy(() =>
  import("@/admin/pages/AdminResumePage").then((m) => ({
    default: m.AdminResumePage,
  })),
);
