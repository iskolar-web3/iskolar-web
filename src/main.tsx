import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";
import { WagmiProvider } from "./integrations/wagmi/provider.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { AuthProvider, useAuth } from "./auth.tsx";
import { Skeleton } from "./components/ui/skeleton.tsx";

// Create a new router instance

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
	routeTree,
	context: {
		...TanStackQueryProviderContext,
		auth: undefined!, // Will be set from the component
	},
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreload: "intent",
	defaultPreloadDelay: 100,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<HelmetProvider>
				<TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
					<WagmiProvider>
						<AuthProvider>
							<App />
						</AuthProvider>
					</WagmiProvider>
				</TanStackQueryProvider.Provider>
			</HelmetProvider>
		</StrictMode>,
	);
}

function App() {
	const auth = useAuth();
	if (auth.isLoading) {
		return <Skeleton />;
	}

	return <RouterProvider router={router} context={{ auth }} />;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
