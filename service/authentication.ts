
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const SignInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userPosition = await getUserPositionByEmail(email);
    const userLevel= await getUserPositionBylevel(email);
    return { user, position: userPosition , level:userLevel};
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
};

export const getUserPositionByEmail = async (email: string) => {
  try {
    const q = query(collection(firestore, 'UserManagement'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const userData = querySnapshot.docs[0].data();
    return userData.role;
  } catch (error) {
    console.error('Error fetching user position:', error);
    return null;
  }
};

export const getUserPositionBylevel = async (email: string) => {
  try {
    const q = query(collection(firestore, 'UserManagement'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const userData = querySnapshot.docs[0].data();
    return userData.level;
  } catch (error) {
    console.error('Error fetching user position:', error);
    return null;
  }
};

export default SignInUser;
