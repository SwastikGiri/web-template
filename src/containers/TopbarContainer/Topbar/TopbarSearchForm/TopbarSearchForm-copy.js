import React, { useRef, useState, useEffect } from 'react';
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
  const [selectedPetSize, setSelectedPetSize] = useState(initialValues.selectedPetSize || null);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({ location: '', start: '', end: '', selectedPetSize: '' });
  const startInputRef = useRef(null); // Add at top of your component
  const endInputRef = useRef(null); // Add at top of your component
  const [minDuration, setMinDuration] = useState(0);
  const [availability, setAvailability] = useState('time-partial');
  const [pub_Dog_Size, setPubDogSize] = useState('');

  const handlePetClick = pet => setSelectedPet(pet);
  const handleKennelClick = kennel => setSelectedKennel(kennel);
  const handlePetSizeChange = value => {
    setSelectedPetSize(prev => (prev === value ? null : value));
    setErrors(prev => ({ ...prev, selectedPetSize: '' }));
  };

  const handleServiceTypeClick = service => setSelectedServiceType(service);
  const handleLocationChange = value => {
    setLocation(value);
    setErrors(prev => ({ ...prev, location: '' })); // Reset location error
  };
  // Helper function (keep this outside your component or above)
  const formatForInput = isoString => {
    if (!isoString) return ''; // Prevent crash if isoString is null/undefined

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return ''; // Prevent crash if date is invalid

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // "yyyy-MM-ddTHH:mm"
  };
  const handleStartChange = e => {
    const localStartDate = e.target.value; // e.g., from input type="datetime-local"
    const startDateISO = new Date(localStartDate).toISOString(); // Convert to ISO format
    setStart(startDateISO); // Store in ISO format for API use
    setErrors(prev => ({ ...prev, start: '' })); // Reset start error
  };
  const handleEndChange = e => {
    const localEndDate = e.target.value;
    const endDateISO = new Date(localEndDate).toISOString();
    setEnd(endDateISO);
    setErrors(prev => ({ ...prev, end: '' }));
  };

  const isSelected = (item, selected) => (selected === item ? css.selected : '');
  const isKeywordsSearch = isMainSearchTypeKeywords(appConfig);
  const formatDisplayDate = date => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
  };
  const calculateMinDuration = (start, end) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const duration = Math.floor((endDate - startDate) / (1000 * 60));
      setMinDuration(duration);
    }
  };
  
  const handleSearchClick = () => {
    let formErrors = {};

    if (!location) formErrors.location = '*This field is required.';
    if (!start) formErrors.start = '*This field is required.';
    if (!end) formErrors.end = '*This field is required.';
    if (!selectedPetSize) formErrors.selectedPetSize = '*This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; 
    }
    if (Object.keys(formErrors).length === 0) {
          // Submit form logic
      props.onSubmit({
        location,
        ...initialValues,
        start,
        end,
        availability,
        minDuration,
        pub_Dog_Size,
      });
    }
  };

  // Define a local onSubmit function for FinalForm if it's not passed
  const localOnSubmit = values => {
    console.log('Form submitted with values:', values);
    handleSearchClick();
  };
  useEffect(() => {
    calculateMinDuration(start, end);
  }, [start, end]);
  useEffect(() => {
    if (selectedPetSize) {
      setPubDogSize(`has_all:${selectedPetSize}`);
    }
  }, [selectedPetSize]);
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
                    <div style={{ marginTop: '-1px' }} className={css.errorMessage}>
                      {errors.location}
                    </div>
                  )}
                </div>
                <div className={css.dateField}>
                  <div
                    className={css.fakeDateInput}
                    onClick={() => startInputRef.current && startInputRef.current.showPicker()}
                  >
                    <div className={css.fakeDateLabel}>Check In</div>
                    <div>{start ? formatDisplayDate(start) : 'MM-DD-YYYY'}</div>
                    <div className={css.fakeDateLabel}>Choose Start Date</div>
                    <span className={css.calendarIcon}>📅</span>
                  </div>

                  <input
                    type="date"
                    ref={startInputRef}
                    min={formatForInput(new Date().toISOString())}
                    value={formatForInput(start)}
                    onChange={e => handleStartChange(e)}
                    className={css.hiddenDateInput}
                  />

                  {errors.start && <div className={css.errorMessage}>{errors.start}</div>}
                </div>

                <div className={css.dateField}>
                  <div
                    className={css.fakeDateInput}
                    onClick={() => endInputRef.current && endInputRef.current.showPicker()}
                  >
                    <div className={css.fakeDateLabel}>Check Out</div>
                    <div>{end ? formatDisplayDate(end) : 'MM-DD-YYYY'}</div>
                    <div className={css.fakeDateLabel}>Choose End Date</div>
                    <span className={css.calendarIcon}>📅</span>
                  </div>

                  <input
                    type="date"
                    value={formatForInput(end)}
                    ref={endInputRef}
                    onChange={e => handleEndChange(e)}
                    className={css.hiddenDateInput}
                    min={start ? formatForInput(start) : undefined}
                  />

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
                <div>
                  <div className={css.petSize}>
                    {[
                      { label: 'Small', value: 'Dog_use1' },
                      { label: 'Medium', value: 'Dog_use2' },
                      { label: 'Large', value: 'Dog_use3' },
                      { label: 'Extra Large', value: 'Dog_use4' }, // if needed
                    ].map(size => (
                      <button
                        key={size.label}
                        type="button"
                        onClick={() => handlePetSizeChange(size.value)}
                        className={`${css.btn} ${
                          selectedPetSize === size.value ? css.selected : ''
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                  {errors.selectedPetSize && (
                    <div className={css.errorMessage}>{errors.selectedPetSize}</div>
                  )}
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
