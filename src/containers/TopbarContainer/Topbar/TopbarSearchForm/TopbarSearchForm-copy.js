import React, { useRef, useState } from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import classNames from 'classnames';
import { useIntl } from '../../../../util/reactIntl';
import { isMainSearchTypeKeywords } from '../../../../util/search';
import small from '../../../../assets/small_dog_7197608.png';
import medium from '../../../../assets/medium_dogs-allowed.png';
import large from '../../../../assets/large_ldoge_16147621.png';
import xlarge from '../../../../assets/xlarge_dog_7174618.png';
import { Form, LocationAutocompleteInput } from '../../../../components';

import IconSearchDesktop from './IconSearchDesktop';
import css from './TopbarSearchForm-copy.module.css';

const identity = v => v;

const KeywordSearchField = props => {
  const { keywordSearchWrapperClasses, iconClass, intl, isMobile = false, inputRef } = props;
  return (
    <div className={keywordSearchWrapperClasses}>
      <button className={css.searchSubmit}>
        <div className={iconClass}>
          <IconSearchDesktop />
        </div>
      </button>
      <Field
        name="keywords"
        render={({ input, meta }) => {
          return (
            <input
              className={isMobile ? css.mobileInput : css.desktopInput}
              {...input}
              id={isMobile ? 'keyword-search-mobile' : 'keyword-search'}
              data-testid={isMobile ? 'keyword-search-mobile' : 'keyword-search'}
              ref={inputRef}
              type="text"
              placeholder={intl.formatMessage({
                id: 'TopbarSearchForm.placeholder',
              })}
              autoComplete="off"
            />
          );
        }}
      />
    </div>
  );
};

const LocationSearchField = props => {
  const { desktopInputRootClass, intl, isMobile = false, inputRef, onLocationChange } = props;
  return (
    <Field
      name="location"
      format={identity}
      render={({ input, meta }) => {
        const { onChange, ...restInput } = input;

        // Merge the standard onChange function with custom behaviur. A better solution would
        // be to use the FormSpy component from Final Form and pass onChange to the
        // onChange prop but that breaks due to insufficient subscription handling.
        // See: https://github.com/final-form/react-final-form/issues/159
        const searchOnChange = value => {
          onChange(value);
          onLocationChange(value);
        };

        return (
          <LocationAutocompleteInput
            className={isMobile ? css.mobileInputRoot : desktopInputRootClass}
            iconClassName={isMobile ? css.mobileIcon : css.desktopIcon}
            inputClassName={isMobile ? css.mobileInput : css.desktopInput}
            predictionsClassName={isMobile ? css.mobilePredictions : css.desktopPredictions}
            predictionsAttributionClassName={isMobile ? css.mobilePredictionsAttribution : null}
            placeholder="Zip or Address"
            closeOnBlur={!isMobile}
            inputRef={inputRef}
            input={{ ...restInput, onChange: searchOnChange }}
            meta={meta}
          />
        );
      }}
    />
  );
};

/**
 * The main search form for the Topbar.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.desktopInputRoot root class for desktop form input
 * @param {Function} props.onSubmit
 * @param {boolean} props.isMobile
 * @param {Object} props.appConfig
 * @returns {JSX.Element} search form element
 */
const TopbarSearchForm = props => {
  const searchInpuRef = useRef(null);
  const intl = useIntl();
  const { appConfig = {}, onSubmit = () => {}, initialValues = {}, ...restOfProps } = props;

  const [start, setStart] = useState(initialValues.start || '');
  const [end, setEnd] = useState(initialValues.end || '');
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedKennel, setSelectedKennel] = useState(null);
  const [selectedPetSize, setSelectedPetSize] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({ location: '', start: '', end: '' });

  const handlePetClick = pet => setSelectedPet(pet);
  const handleKennelClick = kennel => setSelectedKennel(kennel);
  const handlePetSizeClick = size => setSelectedPetSize(size);
  const handleServiceTypeClick = service => setSelectedServiceType(service);
  const handleLocationChange = value => {
    setLocation(value);
    setErrors(prev => ({ ...prev, location: '' })); // Reset location error
  };
    // Helper function (keep this outside your component or above)
    const formatForInput = (isoString) => {
      if (!isoString) return ''; // Prevent crash if isoString is null/undefined
    
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return ''; // Prevent crash if date is invalid
    
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"
    };
    const handleStartChange = (e) => {
      const localStartDate = e.target.value; // e.g., from input type="datetime-local"
      const startDateISO = new Date(localStartDate).toISOString(); // Convert to ISO format
      const formattedForInput = formatForInput(startDateISO); // Optional, for UI binding if needed
      setStart(startDateISO); // Store in ISO format for API use
      setErrors(prev => ({ ...prev, start: '' })); // Reset start error
    };
  const handleEndChange = e => {
    const localEndDate = e.target.value;
    const endDateISO = new Date(localEndDate).toISOString();
    const formattedInput = formatForInput(endDateISO);
    setEnd(endDateISO);
    setErrors(prev => ({ ...prev, end: '' }));
  };
  
  const isSelected = (item, selected) => (selected === item ? css.selected : '');
  const isKeywordsSearch = isMainSearchTypeKeywords(appConfig);

  const handleSearchClick = () => {
    let formErrors = {};

    if (!location) formErrors.location = '*This field is required.';
    if (!start) formErrors.start = '*This field is required.';
    if (!end) formErrors.end = '*This field is required.';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; // Prevent form submission if there are errors
    }
    if (Object.keys(errors).length === 0) {
      const minDurationMinutes = Math.floor((end - start) / (1000 * 60));
      const queryParams = {
        address: location,
        bounds: locationBounds, // if you're using bounds from geolocation
        start,
        end,
        availability: 'time-partial',
        minDuration:minDurationMinutes,
      };

      props.onSubmit(queryParams);
    }

    // Submit form logic
    onSubmit({
      location,
      ...initialValues,
      start,
      end,
      selectedPet,
      selectedKennel,
      selectedPetSize,
      selectedServiceType,
    });
  };

  // Define a local onSubmit function for FinalForm if it's not passed
  const localOnSubmit = values => {
    console.log('Form submitted with values:', values);
    handleSearchClick();
  };

  return (
    <FinalForm
      {...restOfProps}
      onSubmit={localOnSubmit} // Ensure onSubmit is provided
      render={formRenderProps => {
        const {
          rootClassName,
          className,
          desktopInputRoot,
          isMobile = false,
          handleSubmit,
        } = formRenderProps;
        const classes = classNames(rootClassName, className);
        const desktopInputRootClass = desktopInputRoot || css.desktopInputRoot;

        const keywordSearchWrapperClasses = classNames(
          css.keywordSearchWrapper,
          isMobile ? css.mobileInputRoot : desktopInputRootClass
        );

        return (
          <Form
            className={`${classes} ${css.searchForm}`}
            onSubmit={e => e.preventDefault()} // Prevent the default form submit
          >
            <div className={css.FilterContainer}>
              <div className={css.petFilter}>
                <button
                  type="button"
                  onClick={() => handlePetClick('Dog')}
                  className={`${css.filters} ${isSelected('Dog', selectedPet)}`}
                >
                  Dog
                </button>
                <button
                  type="button"
                  onClick={() => handlePetClick('Cat')}
                  className={`${css.filters} ${isSelected('Cat', selectedPet)} ${css.catbtn}`}
                >
                  Cat
                </button>
              </div>
              <div className={css.kennelFilter}>
                {['Luxury', 'Farm Stay', 'Indoor', 'Outdoor'].map(kennel => (
                  <button
                    key={kennel}
                    type="button"
                    onClick={() => handleKennelClick(kennel)}
                    className={`${css.filters} ${isSelected(kennel, selectedKennel)}`}
                  >
                    {kennel}
                  </button>
                ))}
              </div>
            </div>
            <div className={css.subForm}>
              <div className={css.inputFields}>
                <div className={css.addressInput}>
                  {isKeywordsSearch ? (
                    <KeywordSearchField
                      keywordSearchWrapperClasses={keywordSearchWrapperClasses}
                      iconClass={classNames(
                        isMobile ? css.mobileIcon : css.desktopIcon || css.icon
                      )}
                      intl={intl}
                      isMobile={isMobile}
                      inputRef={searchInpuRef}
                    />
                  ) : (
                    <LocationSearchField
                      desktopInputRootClass={desktopInputRootClass}
                      intl={intl}
                      isMobile={isMobile}
                      inputRef={searchInpuRef}
                      onLocationChange={handleLocationChange} // Update location when changed
                    />
                  )}
                  {errors.location && (
                    <div style={{ marginTop: '4px' }} className={css.errorMessage}>
                      {errors.location}
                    </div>
                  )}
                </div>
                <div className={css.dateField}>
                  <input
                    type="datetime-local"
                    value={formatForInput(start)}
                    onChange={e => handleStartChange(e)}
                    className={css.dateInput}
                  />
                  <span className={css.placeholder}>Check In</span>
                  {errors.start && <div className={css.errorMessage}>{errors.start}</div>}
                </div>

                <div className={css.dateField}>
                  <input
                    type="datetime-local"
                    value={formatForInput(end)}
                    onChange={e => handleEndChange(e)}
                    className={css.dateInput}
                    min={start}
                  />
                  <span className={css.placeholder}>Check Out</span>
                  {errors.end && <div className={css.errorMessage}>{errors.end}</div>}
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
                  {[
                    { label: 'Small', icon: small },
                    { label: 'Medium', icon: medium },
                    { label: 'Large', icon: large },
                    { label: 'Extra Large', icon: xlarge },
                  ].map(size => (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => handlePetSizeClick(size.label)}
                      className={`${css.btn} ${isSelected(size.label, selectedPetSize)}`}
                    >
                      <img src={size.icon} alt={size.label} className={css.dogIcon} />
                      {size.label}
                    </button>
                  ))}
                </div>

                {/* Search Button */}
                <button type="button" onClick={handleSearchClick} className={css.searchbtn}>
                  Search
                </button>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default TopbarSearchForm;
