import {
	createContext,
	type JSX,
	type ReactNode,
	useContext,
	useState,
	useEffect,
} from "react";
import { deleteCookie, getCookie, setCookie } from "./lib/cookie";
import { UserRole, type AuthSession, type User } from "./lib/user/model";
import {
	ACCESS_TOKEN_KEY,
	validateSession,
} from "./lib/user/auth";
import { getMyStudentProfile } from "./lib/student/api";
import { getMySponsorProfile } from "./lib/sponsor/api";

const AUTH_CACHE_KEY = "auth_cache";

type AuthCache = {
	user: User;
	profile: unknown;
};

function loadAuthCache(): AuthCache | null {
	try {
		const raw = localStorage.getItem(AUTH_CACHE_KEY);
		return raw ? (JSON.parse(raw) as AuthCache) : null;
	} catch {
		return null;
	}
}

function saveAuthCache(user: User, profile: unknown) {
	try {
		localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ user, profile }));
	} catch {
		// ignore storage errors
	}
}

function clearAuthCache() {
	localStorage.removeItem(AUTH_CACHE_KEY);
}

export type AuthContextValue<T = any> = {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	profile: T;
	setProfile: React.Dispatch<React.SetStateAction<T>>;
	sessionToken: string;
	getSession: () => Promise<AuthSession | null>;
	logout: () => Promise<void>;
	isLoading: boolean;
	error: Error | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
	children: ReactNode;
};

export function AuthProvider(props: AuthProviderProps): JSX.Element {
	const cachedAuth = loadAuthCache();
	const [user, setUser] = useState<User | null>(cachedAuth?.user ?? null);
	const [sessionToken, setSessionToken] = useState<string>("");
	const [profile, setProfile] = useState<any | null>(cachedAuth?.profile ?? null);
	const [isLoading, setIsLoading] = useState(!cachedAuth);
	const [error, setError] = useState<Error | null>(null);

	async function getSession(): Promise<AuthSession | null> {
		try {
			const oldToken = getCookie(ACCESS_TOKEN_KEY);
			if (!oldToken) {
				clearAuthCache();
				setUser(null);
				setProfile(null);
				return null;
			}

			let session: Awaited<ReturnType<typeof validateSession>>;
			try {
				session = await validateSession(oldToken);
			} catch {
				deleteCookie(ACCESS_TOKEN_KEY);
				clearAuthCache();
				setUser(null);
				setProfile(null);
				return null;
			}

			if (!session.data) {
				deleteCookie(ACCESS_TOKEN_KEY);
				clearAuthCache();
				setUser(null);
				setProfile(null);
				setError(new Error(session.message));
				return null;
			}

			const maxAgeSeconds = session.data.user.role
				? 30 * 24 * 60 * 60 // 30 days
				: 60 * 60; // 1 hour
			const expires = new Date(Date.now() + maxAgeSeconds * 1000);

			setUser(session.data.user);
			setSessionToken(session.data.token);
			setCookie(ACCESS_TOKEN_KEY, session.data.token, { expires });

			let resolvedProfile: unknown = null;
			switch (session.data.user.role?.code) {
				case UserRole.Student: {
					resolvedProfile = await getMyStudentProfile(session.data.token);
					setProfile(resolvedProfile);
					break;
				}
				case UserRole.Sponsor: {
					resolvedProfile = await getMySponsorProfile(session.data.token);
					setProfile(resolvedProfile);
					break;
				}
				case UserRole.Admin:
					setProfile(null);
					break;
				default:
					setProfile(null);
			}

			saveAuthCache(session.data.user, resolvedProfile);
			return session.data;
		} finally {
			setIsLoading(false);
		}
	}

	async function logout(): Promise<void> {
		setUser(null);
		setProfile(null);
		setSessionToken("");
		setError(null);
		deleteCookie(ACCESS_TOKEN_KEY);
		clearAuthCache();
	}

	useEffect(() => {
		getSession();
	}, []);

	return (
		<AuthContext
			value={{
				user,
				setUser,
				profile,
				setProfile,
				getSession,
				logout,
				sessionToken,
				isLoading,
				error,
			}}
		>
			{props.children}
		</AuthContext>
	);
}

export function useAuth<T = any>(): AuthContextValue<T> {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context as AuthContextValue<T>;
}
