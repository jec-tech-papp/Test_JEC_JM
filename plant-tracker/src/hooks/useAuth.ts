import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { getUserProfile, setUserProfile } from '@/lib/firestore'
import type { UserProfile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const existing = await getUserProfile(result.user.uid)
    if (!existing) {
      const newProfile: Omit<UserProfile, 'createdAt'> = {
        uid: result.user.uid,
        email: result.user.email ?? '',
        displayName: result.user.displayName ?? 'Plant Addict',
        photoURL: result.user.photoURL ?? undefined,
        preferences: {
          language: 'fr',
          notificationsEnabled: true,
          reminderDaysBefore: 1,
          theme: 'light',
        },
      }
      await setUserProfile(newProfile)
      setProfile({ ...newProfile, createdAt: new Date() })
    } else {
      setProfile(existing)
    }
    return result.user
  }

  const loginWithEmail = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    const newProfile: Omit<UserProfile, 'createdAt'> = {
      uid: result.user.uid,
      email,
      displayName,
      preferences: {
        language: 'fr',
        notificationsEnabled: true,
        reminderDaysBefore: 1,
        theme: 'light',
      },
    }
    await setUserProfile(newProfile)
    setProfile({ ...newProfile, createdAt: new Date() })
    return result.user
  }

  const logout = () => signOut(auth)

  return { user, profile, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }
}
