import React from 'react'
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { firestore } from '../../../firebaseConfig';
function index() {

    const updateBarcodePrefix = async () => {
        const stockCollection = collection(firestore, "Stock");
        const querySnapshot = await getDocs(stockCollection);
    
        const batch = writeBatch(firestore);
        let count = 0;
    
        for (const document of querySnapshot.docs) {
            const data = document.data();
            if (data.barcode) {
                const barcodePrefix = data.barcode.toString().slice(0, 4); // Extract first 4 characters
                const docRef = doc(firestore, "Stock", document.id);
                batch.update(docRef, { barcodePrefix });
    
                count++;
    
                // Firestore allows max 500 writes per batch, commit when limit is reached
                if (count % 500 === 0) {
                    await batch.commit(); // Commit the batch
                    console.log(`Updated ${count} documents...`);
                }
            }
        }
    
        // Commit remaining batch if not empty
        if (count % 500 !== 0) {
            await batch.commit();
        }
    
        console.log("All documents updated successfully!");
    };
    

   
  return (
    <button onClick={updateBarcodePrefix}>update stock</button>
  )
}

export default index