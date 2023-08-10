import HomePage from "./components/HomePage";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

export default function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <HomePage />
    </AppProvider>
  );
}
