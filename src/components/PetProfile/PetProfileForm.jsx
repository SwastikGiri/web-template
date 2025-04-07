import React, { useState } from 'react';

const PetProfileForm = ({ onSubmit }) => {
  const [formValues, setFormValues] = useState({
    petName: '',
    appetite: '',
    vaccinations: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Pet Name:
        <input type="text" name="petName" value={formValues.petName} onChange={handleChange} required />
      </label>
      <label>Appetite:
        <input type="text" name="appetite" value={formValues.appetite} onChange={handleChange} />
      </label>
      <label>Vaccination History:
        <textarea name="vaccinations" value={formValues.vaccinations} onChange={handleChange} />
      </label>
      <button type="submit">Submit Pet Profile</button>
    </form>
  );
};

export default PetProfileForm;
