import { User } from '../types';
import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';

const usersCollection = collection(db, 'users');

/**
 * Signs in the user with a Google account popup.
 * If the user is new, it creates a new entry in the Firestore 'users' collection.
 */
export const signInWithGoogle = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await createUserInFirestore(result.user, true); // `true` to not overwrite existing data
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error;
  }
};

/**
 * Creates a user document in Firestore.
 * @param user The Firebase Auth user object.
 * @param merge Whether to merge with an existing document. Should be true for login.
 */
export const createUserInFirestore = async (user: FirebaseUser, merge = false): Promise<User> => {
  const userRef = doc(usersCollection, user.uid);
  const newUser: User = {
    uid: user.uid,
    name: user.displayName || '익명',
    score: 0,
    photoURL: user.photoURL || '',
  };

  if (merge) {
    // Check if document exists first to not overwrite score on login
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, newUser);
      return newUser;
    } else {
      // Update name and photoURL on every login, but keep score
      await updateDoc(userRef, {
        name: user.displayName || '익명',
        photoURL: user.photoURL || '',
      });
      return docSnap.data() as User;
    }
  } else {
    await setDoc(userRef, newUser);
    return newUser;
  }
};

/**
 * Fetches a user's data from Firestore.
 * @param uid The user's unique ID.
 * @returns {Promise<User | null>} The user data or null if not found.
 */
export const getUser = async (uid: string): Promise<User | null> => {
    const userRef = doc(usersCollection, uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as User;
    }
    return null;
}

/**
 * Signs out the current user.
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Updates the high score for a user if the new score is higher.
 * @param uid The user's unique ID.
 * @param score The new score.
 * @returns {Promise<User | null>} The updated user object.
 */
export const updateHighScore = async (uid: string, score: number): Promise<User | null> => {
  const userRef = doc(usersCollection, uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const currentUser = docSnap.data() as User;
    if (score > currentUser.score) {
      await updateDoc(userRef, { score: score });
      return { ...currentUser, score };
    }
    return currentUser;
  }
  return null;
};

/**
 * Fetches the top rankings from Firestore.
 * @returns {Promise<User[]>} A sorted list of users by score.
 */
export const getRankings = async (): Promise<User[]> => {
  const q = query(usersCollection, orderBy('score', 'desc'), limit(100));
  const querySnapshot = await getDocs(q);
  
  const rankings: User[] = [];
  querySnapshot.forEach((doc) => {
    rankings.push(doc.data() as User);
  });

  return rankings;
};