import React from 'react';
import { createInstance } from '../../util/sdkLoader';;
import { useHistory } from 'react-router-dom';


const sdk = createInstance({
  clientId: process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID,
});
const CreateTestTransaction = () => {
  const history = useHistory();

  const handleCreate = async () => {
    try {
        const response = await sdk.transactions.initiate({
          processAlias: 'pet-default-inquiry/release-1',
            transition: 'transition/inquire-without-payment',
            params: {
              listingId: {
                uuid: '67f690e0-8f69-46c1-9cab-969bbce13789',
                type: 'listing',
              },
            },
          });
          

      const transactionId = response.data.data.id.uuid;
      console.log('Created test transaction:', transactionId);

      // Redirect to the pet profile test form
      history.push(`/test-pet-profile/${transactionId}`);
    } catch (err) {
        console.error('Error creating test transaction:', err);
      
        const errorDetails = err?.data?.errors;
        if (errorDetails && Array.isArray(errorDetails)) {
          console.error('Sharetribe Error Details:', JSON.stringify(errorDetails, null, 2));
        }
      
        alert('Failed to create transaction.');
      }
           
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create Test Transaction</h2>
      <button onClick={handleCreate}>Generate Test Transaction</button>
    </div>
  );
};

export default CreateTestTransaction;
