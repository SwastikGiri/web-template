import React, { useState } from 'react';
import css from '../SearchForm/SearchForm.module.css';
import { LocationAutocompleteInput } from '../../components';
import NamedRedirect from '../NamedRedirect/NamedRedirect';

function SearchForm() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedKennel, setSelectedKennel] = useState(null);
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [redirectParams, setRedirectParams] = useState(null);
  const [location, setLocation] = useState(null);

  const handlePetClick = pet => setSelectedPet(pet);
  const handleKennelClick = kennel => setSelectedKennel(kennel);
  const handlePetSizeClick = size => setSelectedPetSize(size);
  const handleServiceTypeClick = service => setSelectedServiceType(service);
  const handleLocationChange = value => setLocation(value);

  const isSelected = (item, selected) => (selected === item ? css.selected : '');

  const handleSubmit = e => {
    e.preventDefault();

    if (!location || !location.selectedPlace || !location.selectedPlace.address) {
      alert('Please select a valid location.');
      return;
    }

    const selectedPlace = location.selectedPlace;
    const bounds = selectedPlace.origin?.bounds;

    const boundsString =
      bounds && bounds.ne && bounds.sw
        ? `${bounds.ne.lat},${bounds.ne.lng},${bounds.sw.lat},${bounds.sw.lng}`
        : null;

        const searchParams = {
          address: selectedPlace.address,
          bounds: boundsString,
          startDate,
          endDate,
          pet: selectedPet,
          kennel: selectedKennel,
          petSize: selectedPetSize,
          serviceType: selectedServiceType,
        };

    setRedirectParams(searchParams);
  };

  return (
    <>
      <form className={css.searchForm} onSubmit={handleSubmit}>
        <div className={css.subForm}>
          <div className={css.inputFields}>
            <LocationAutocompleteInput
              className={css.addressInput}
              input={{
                name: 'location',
                value: location,
                onChange: handleLocationChange,
                onFocus: () => {},
                onBlur: () => {},
              }}
              meta={{ touched: false, error: null }}
              placeholder="Search location"
              id="location"
            />

            <div className={css.dateField}>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={css.dateInput}
              />
              <span className={css.placeholder}>Choose Start Date</span>
            </div>

            <div className={css.dateField}>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={css.dateInput}
                min={startDate}
              />
              <span className={css.placeholder}>Choose End Date</span>
            </div>
          </div>

          <div className={css.serviceType}>
            <button
              type="button"
              onClick={() => handleServiceTypeClick('Boarding')}
              className={`${css.btn} ${isSelected('Boarding', selectedServiceType)}`}
            >
              Boarding
            </button>
            <button
              type="button"
              onClick={() => handleServiceTypeClick('Day Care')}
              className={`${css.btn} ${isSelected('Day Care', selectedServiceType)}`}
            >
              Day Care
            </button>
          </div>

          <div className={css.subFormSection}>
            <div className={css.petSize}>
              {['Small', 'Medium', 'Large', 'Extra Large'].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePetSizeClick(size)}
                  className={`${css.btn} ${isSelected(size, selectedPetSize)}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <input type="submit" value="Search" className={css.searchbtn} />
          </div>
        </div>
      </form>

      {redirectParams && <NamedRedirect name="SearchPage" params={redirectParams} />}
    </>
  );
}

export default SearchForm;
