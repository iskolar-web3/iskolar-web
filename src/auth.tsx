import {
	createContext,
	type JSX,
	type ReactNode,
	useContext,
	useState,
	useEffect,
} from "react";
import { UserRole, type AuthSession, type User } from "./lib/user/model";
import { BACKEND_URL } from "./lib/api";
import { validateSession } from "./lib/user/auth";
import { getMyStudentProfile } from "./lib/student/api";
import { getMySponsorProfile } from "./lib/sponsor/api";

const LEGACY_AUTH_CACHE_KEYS = ["auth_cache"];

function purgeAuthCache() {
	for (const key of LEGACY_AUTH_CACHE_KEYS) {
		localStorage.removeItem(key);
	}
}

export type AuthContextValue<T = any> = {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	profile: T;
	setProfile: React.Dispatch<React.SetStateAction<T>>;
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
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	async function getSession(): Promise<AuthSession | null> {
		setError(null);
		try {
			let session: Awaited<ReturnType<typeof validateSession>>;
			try {
				session = await validateSession();
			} catch {
				setUser(null);
				setProfile(null);
				return null;
			}

			if (!session.data) {
				setUser(null);
				setProfile(null);
				setError(new Error(session.message));
				return null;
			}

			setUser(session.data.user);

			let resolvedProfile: unknown = null;
			switch (session.data.user.role?.code) {
				case UserRole.Student: {
					resolvedProfile = await getMyStudentProfile();
					setProfile(resolvedProfile);
					break;
				}
				case UserRole.Sponsor: {
					resolvedProfile = await getMySponsorProfile();
					setProfile(resolvedProfile);
					break;
				}
				case UserRole.Admin:
					setProfile(null);
					break;
				default:
					setProfile(null);
			}

			return session.data;
		} finally {
			setIsLoading(false);
		}
	}

	async function logout(): Promise<void> {
		await fetch(`${BACKEND_URL}/logout`, {
			method: "POST",
			credentials: "include",
		});
		setUser(null);
		setProfile(null);
		setError(null);
	}

	useEffect(() => {
		purgeAuthCache();
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
