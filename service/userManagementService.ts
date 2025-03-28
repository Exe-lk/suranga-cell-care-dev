import { firestore, auth } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser as deleteAuthUser } from 'firebase/auth';
import Swal from 'sweetalert2';

export const createUser = async (name: string, role: any, nic: string, email: string, mobile: string,level:string) => {
  const q = query(
    collection(firestore, 'UserManagement'),
    where('nic', '==', nic)
  );
  const q2 = query(
    collection(firestore, 'UserManagement'),
    where('email', '==', email)
  );
  const nicSnapshot = await getDocs(q);
  const emailSnapshot = await getDocs(q2);
  if (!nicSnapshot.empty) {
    await Swal.fire({
      icon: 'error',
      title: 'NIC Already Exists',
      text: 'This NIC has already been added. Please use a unique NIC.',
    });
    throw new Error('NIC already exists');
  }
  if (!emailSnapshot.empty) {
    await Swal.fire({
      icon: 'error',
      title: 'Email Already Exists',
      text: 'This email has already been added. Please use a unique email.',
    });
    throw new Error('Email already exists');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, nic);
  const user = userCredential.user;
  const status = true;
  const docRef = await addDoc(collection(firestore, 'UserManagement'), { name, role, nic, email, mobile, status,level });
  return docRef.id;
};

export const getUser = async () => {
  const q = query(collection(firestore, 'UserManagement'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteUser = async () => {
  const q = query(collection(firestore, 'UserManagement'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (id: string) => {
  const userRef = doc(firestore, 'UserManagement', id);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  } else {
    return null;
  }
};

export const updateUser = async (id: string, name: string, role: any, nic: string, email: string, mobile: string, status: boolean, level:string) => {
  const userRef = doc(firestore, 'UserManagement', id);
console.log(name, role, nic, email, mobile, status,level)
  await updateDoc(userRef, { name, role, nic, email, mobile, status,level });
};

export const deleteUser = async (id: string) => {
  try {
    const userRef = doc(firestore, 'UserManagement', id);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User with ID ${id} not found.`);
    }
    const { email, nic } = userSnap.data();
    const userCredential = await signInWithEmailAndPassword(auth, email, nic);
    const user = userCredential.user;
    await deleteAuthUser(user);
    await deleteDoc(userRef);
    console.log(`User with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
