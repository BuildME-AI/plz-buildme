import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { InterviewPage } from "./pages/InterviewPage";
import { InterviewResultPage } from "./pages/InterviewResultPage";
import { ResultPage } from "./pages/ResultPage";
import { JobMatchPage } from "./pages/JobMatchPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { LoginPage } from "./pages/LoginPage";
import { PricingPage } from "./pages/PricingPage";
import { OnboardingStep1 } from "./pages/onboarding/OnboardingStep1";
import { OnboardingStep2 } from "./pages/onboarding/OnboardingStep2";
import { OnboardingStep3 } from "./pages/onboarding/OnboardingStep3";
import { OnboardingStep4 } from "./pages/onboarding/OnboardingStep4";
import { OnboardingStep5 } from "./pages/onboarding/OnboardingStep5";
import { OnboardingStep6 } from "./pages/onboarding/OnboardingStep6";
import { OnboardingStep7 } from "./pages/onboarding/OnboardingStep7";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/onboarding/step1",
    Component: OnboardingStep1,
  },
  {
    path: "/onboarding/step2",
    Component: OnboardingStep2,
  },
  {
    path: "/onboarding/step3",
    Component: OnboardingStep3,
  },
  {
    path: "/onboarding/step4",
    Component: OnboardingStep4,
  },
  {
    path: "/onboarding/step5",
    Component: OnboardingStep5,
  },
  {
    path: "/onboarding/step6",
    Component: OnboardingStep6,
  },
  {
    path: "/onboarding/step7",
    Component: OnboardingStep7,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/experience",
    Component: ExperiencePage,
  },
  {
    path: "/interview",
    Component: InterviewPage,
  },
  {
    path: "/interview-result",
    Component: InterviewResultPage,
  },
  {
    path: "/result",
    Component: ResultPage,
  },
  {
    path: "/job-match",
    Component: JobMatchPage,
  },
  {
    path: "/portfolio",
    Component: PortfolioPage,
  },
  {
    path: "/analytics",
    Component: AnalyticsPage,
  },
  {
    path: "/pricing",
    Component: PricingPage,
  },
]);