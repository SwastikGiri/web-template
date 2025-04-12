import React from 'react';
import classNames from 'classnames';
import { useConfiguration } from '../../../../context/configurationContext';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { useHistory, useLocation } from 'react-router-dom';
import { parse } from '../../../../util/urlHelpers';
import { isMainSearchTypeKeywords, isOriginInUse } from '../../../../util/search';
import { createResourceLocatorString } from '../../../../util/routes';


import Field, { hasDataInFields } from '../../Field';

import SectionContainer from '../SectionContainer';
import css from './SectionHero.module.css';

import SearchForm from '../../../../components/SearchForm/SearchForm';
import TopbarSearchForm from '../../../TopbarContainer/Topbar/TopbarSearchForm/TopbarSearchForm-copy';
/**
 * @typedef {Object} FieldComponentConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

/**
 * Section component for a website's hero section
 * The Section Hero doesn't have any Blocks by default, all the configurations are made in the Section Hero settings
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {Object} props.defaultClasses
 * @param {string} props.defaultClasses.sectionDetails
 * @param {string} props.defaultClasses.title
 * @param {string} props.defaultClasses.description
 * @param {string} props.defaultClasses.ctaButton
 * @param {string} props.sectionId id of the section
 * @param {'hero'} props.sectionType
 * @param {Object?} props.title
 * @param {Object?} props.description
 * @param {Object?} props.appearance
 * @param {Object?} props.callToAction
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} Section for article content
 */
const SectionHero = props => {
  const {
    sectionId,
    className,
    rootClassName,
    defaultClasses,
    title,
    description,
    appearance,
    callToAction,
    options,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);
  const initialSearchFormValues = {};
  const config = useConfiguration();
const routeConfiguration = useRouteConfiguration();
const history = useHistory();
const location = useLocation(); // in case you want to access current query

const handleSubmit = values => {
  const topbarSearchParams = () => {
    if (isMainSearchTypeKeywords(config)) {
      return { keywords: values?.keywords };
    }

    // topbar search defaults to 'location' search
    const { search, selectedPlace } = values?.location || {};
    const { origin, bounds } = selectedPlace || {};
    const originMaybe = isOriginInUse(config) ? { origin } : {};

    return {
      ...originMaybe,
      address: search,
      bounds,
    };
  };

  const currentSearchParams = parse(location.search);
  const searchParams = {
    ...currentSearchParams,
    ...topbarSearchParams(),
  };

  history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, searchParams));
};


  return (
    <SectionContainer
      id={sectionId}
      className={className}
      rootClassName={classNames(rootClassName || css.root)}
      appearance={appearance}
      options={fieldOptions}
    >
      {hasHeaderFields ? (
        <header className={defaultClasses.sectionDetails}>
          <Field data={title} className={defaultClasses.title} options={fieldOptions} />
          <Field data={description} className={defaultClasses.description} options={fieldOptions} />
          <Field data={callToAction} className={defaultClasses.ctaButton} options={fieldOptions} />
          <div className={css.searchContainer}>
  <TopbarSearchForm
    onSubmit={handleSubmit}
    initialValues={initialSearchFormValues}
    isMobile={false} // or true if you want mobile styles
    appConfig={config}
  />
</div>
        </header>
      ) : null}
    </SectionContainer>
  );
};

export default SectionHero;
