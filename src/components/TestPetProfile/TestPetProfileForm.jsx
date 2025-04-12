import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { createInstance } from '../../util/sdkLoader';;

const sdk = createInstance({
  clientId: process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID,
});

const TestPetProfileForm = () => {
  const [petName, setPetName] = useState('');
  const [appetite, setAppetite] = useState('');
  const [vaccinated, setVaccinated] = useState(false);
  const history = useHistory();
  const { id } = useParams(); // get transaction UUID from URL

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await sdk.transactions.transition({
        id: { uuid: id, type: 'transaction' },
        transition: 'transition/inquire-without-payment',
        params: {
          protectedData: {
            petName,
            appetite,
            vaccinated,
          },
        },
      });

      alert('Pet profile submitted!');
      history.push(`/order-details/${id}`);
    } catch (err) {
      console.error('Error submitting pet profile', err);
      alert('Something went wrong!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Pet Name</label>
      <input value={petName} onChange={e => setPetName(e.target.value)} required />

      <label>Appetite</label>
      <input value={appetite} onChange={e => setAppetite(e.target.value)} required />

      <label>Vaccinated?</label>
      <input type="checkbox" checked={vaccinated} onChange={e => setVaccinated(e.target.checked)} />

      <button type="submit">Submit Pet Profile</button>
    </form>
  );
};

export default TestPetProfileForm;
