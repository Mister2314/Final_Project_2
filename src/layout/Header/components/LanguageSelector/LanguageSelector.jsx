import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import { useTranslation } from "react-i18next";
import CountryFlag from "react-country-flag";
import styles from "./LanguageSelector.module.css";

const allOptions = [
  { value: "en", label: "EN", code: "US", country: "United States" },
  { value: "az", label: "AZ", code: "AZ", country: "Azerbaijan" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(
    allOptions.find((opt) => opt.value === i18n.language) || allOptions[0]
  );

  // Filter out the currently selected language from options
  const getFilteredOptions = () => {
    return allOptions.filter((option) => option.value !== selected?.value);
  };

  useEffect(() => {
    const currentOption = allOptions.find((opt) => opt.value === i18n.language);
    if (currentOption && currentOption.value !== selected?.value) {
      setSelected(currentOption);
    }
  }, [i18n.language]);

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setSelected(selectedOption);
      i18n.changeLanguage(selectedOption.value);
      localStorage.setItem("i18nextLng", selectedOption.value);
    }
  };

  const SingleValueComponent = (props) => {
    const { data } = props;
    return (
      <components.SingleValue {...props}>
        <div className={styles.customSingleValue}>
          <CountryFlag
            countryCode={data.code}
            svg
            className={styles.flagImage}
          />
          <span className={styles.languageCode}>{data.label}</span>
        </div>
      </components.SingleValue>
    );
  };

  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className={styles.customOption}>
        <CountryFlag
          countryCode={data.code}
          svg
          className={styles.flagImage}
        />
        <span className={styles.languageCode}>{data.label}</span>
      </div>
    );
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1600,
      position: 'absolute'
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 1600
    }),
    control: (provided) => ({
      ...provided,
      cursor: 'pointer'
    })
  };

  return (
    <div className={styles.languageSelector}>
      <Select
        options={getFilteredOptions()}
        value={selected}
        onChange={handleChange}
        className={styles.languageSelect}
        classNamePrefix="languageSelect"
        isSearchable={false}
        components={{
          SingleValue: SingleValueComponent,
          Option: CustomOption,
        }}
        styles={customStyles}
        menuPortalTarget={document.body} 
        menuPosition="fixed" 
      />
    </div>
  );
};

export default LanguageSelector;