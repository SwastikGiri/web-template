import React, { useState } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from '../../util/reactIntl';
import  Page  from '../../components/Page/Page';
import LayoutSingleColumn from '../../components/LayoutComposer/LayoutSingleColumn/LayoutSingleColumn';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import UserNav from '../../components/UserNav/UserNav';

import { isScrollingDisabled } from '../../ducks/ui.duck'; // Correct import
import css from './MyPetsPage.module.css';

const MyPetsPageComponent = props => {
  const { scrollingDisabled } = props;

  const [pets, setPets] = useState([
    { id: 1, name: '', size: '', appetite: '', vaccination: '', age: '', breed: '' },
  ]);

  const addPet = () => {
    const newPet = {
      id: Date.now(),
      name: '',
      size: '',
      appetite: '',
      vaccination: '',
      age: '',
      breed: '',
    };
    setPets([...pets, newPet]);
  };

  const removePet = id => {
    setPets(pets.filter(pet => pet.id !== id));
  };

  const handleChange = (id, field, value) => {
    setPets(pets.map(pet => (pet.id === id ? { ...pet, [field]: value } : pet)));
  };

  const content = (
    <div className={css.container}>
      <h1 className={css.title}>
        <FormattedMessage id="MyPetsPage.title" defaultMessage="My Pets" />
      </h1>

      {pets.map(pet => (
        <div key={pet.id} className={css.petCard}>
          <input
            className={css.input}
            type="text"
            placeholder="Pet Name"
            value={pet.name}
            onChange={e => handleChange(pet.id, 'name', e.target.value)}
          />
          <input
            className={css.input}
            type="text"
            placeholder="Size"
            value={pet.size}
            onChange={e => handleChange(pet.id, 'size', e.target.value)}
          />
          <input
            className={css.input}
            type="text"
            placeholder="Appetite"
            value={pet.appetite}
            onChange={e => handleChange(pet.id, 'appetite', e.target.value)}
          />
          <input
            className={css.input}
            type="text"
            placeholder="Vaccination Details"
            value={pet.vaccination}
            onChange={e => handleChange(pet.id, 'vaccination', e.target.value)}
          />
          <input
            className={css.input}
            type="text"
            placeholder="Age"
            value={pet.age}
            onChange={e => handleChange(pet.id, 'age', e.target.value)}
          />
          <input
            className={css.input}
            type="text"
            placeholder="Breed"
            value={pet.breed}
            onChange={e => handleChange(pet.id, 'breed', e.target.value)}
          />

          {/* Remove button */}
          <button
            className={css.removeButton}
            onClick={() => removePet(pet.id)}
            disabled={pets.length <= 1} // Prevent removal if only one pet exists
          >
         Remove
          </button>
        </div>
      ))}

      <button className={css.addButton} onClick={addPet}>
        + Add More
      </button>
    </div>
  );

  return (
    <Page
      title="My Pets"
      scrollingDisabled={scrollingDisabled}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WebPage',
        name: 'My Pets',
      }}
    >
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer />
            <UserNav currentPage="MyPetsPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        {content}
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => ({
  scrollingDisabled: isScrollingDisabled(state),
});

const MyPetsPage = connect(mapStateToProps)(MyPetsPageComponent);

export default MyPetsPage;
