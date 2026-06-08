import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface DemoUser {
  uid: string;
  email: string;
}

interface AuthContextValue {
  user: User | DemoUser | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USERS_KEY = 'plantaddict_demo_users';
const DEMO_SESSION_KEY = 'plantaddict_demo_session';

function getDemoUsers(): Record<string, string> {
  const raw = localStorage.getItem(DEMO_USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveDemoUsers(users: Record<string, string>) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isFirebaseConfigured;

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    }
    const session = localStorage.getItem(DEMO_SESSION_KEY);
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
    const users = getDemoUsers();
    if (users[email] !== password) {
      throw new Error('auth/login-failed');
    }
    const demoUser: DemoUser = { uid: email, email };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const register = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      await createUserWithEmailAndPassword(auth, email, password);
      return;
    }
    const users = getDemoUsers();
    if (users[email]) {
      throw new Error('auth/email-already-in-use');
    }
    users[email] = password;
    saveDemoUsers(users);
    const demoUser: DemoUser = { uid: email, email };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
      return;
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getUserId(user: User | DemoUser): string {
  return user.uid;
}
