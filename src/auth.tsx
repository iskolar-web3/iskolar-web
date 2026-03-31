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
	REFRESH_TOKEN_KEY,
	validateSession,
} from "./lib/user/auth";
import { getMyStudentProfile } from "./lib/student/api";
import { getMySponsorProfile } from "./lib/sponsor/api";

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
	const [user, setUser] = useState<User | null>(null);
	const [sessionToken, setSessionToken] = useState<string>("");
	const [profile, setProfile] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	async function getSession(): Promise<AuthSession | null> {
		try {
			const token = getCookie(ACCESS_TOKEN_KEY);
			if (!token) {
				return null;
			}

			const session = await validateSession(token);

			if (session.data === null) {
				deleteCookie(ACCESS_TOKEN_KEY);
				deleteCookie(REFRESH_TOKEN_KEY);
				setUser(null);
				setError(new Error(session.message));
				return null;
			}

			const maxAgeSeconds = session.data.user.role
				? 30 * 24 * 60 * 60 // 30 days
				: 60 * 60; // 1 hour
			const expires = new Date(Date.now() + maxAgeSeconds * 1000);

			setUser(session.data.user);
			setSessionToken(token);
			setCookie(ACCESS_TOKEN_KEY, session.data.token, { expires });
			setCookie(REFRESH_TOKEN_KEY, session.data.refreshToken, { expires });

			switch (session.data.user.role?.code) {
				case UserRole.Student:
					const student = await getMyStudentProfile(token);
					setProfile(student);
					break;

				case UserRole.Sponsor:
					const sponsor = await getMySponsorProfile(token);
					setProfile(sponsor);
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
		const token = getCookie(ACCESS_TOKEN_KEY);
		if (!token || !user) {
			console.log("No token or user");
			return;
		}

		setUser(null);
		deleteCookie(ACCESS_TOKEN_KEY);
		deleteCookie(REFRESH_TOKEN_KEY);
		console.log("Logged out");
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
