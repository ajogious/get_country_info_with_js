'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const countryName = document.querySelector('#country-name-input');

// global variables
let countryDataCache = {};

////////////////////////////////////////////////////////////////////////

const renderCountry = function (data, className = '') {
  const { name, region, population, flags, languages, currencies } = data[0];

  const langKeys = Object.values(languages).join(', ');
  const currencyData = Object.values(currencies)[0].name;

  const html = `
        <article class="country ${className}">
          <img class="country__img" src="${flags.png}" />
          <div class="country__data">
            <h3 class="country__name">${name.common}</h3>
            <h4 class="country__region">${region}</h4>
            <p class="country__row"><span>👫</span>${(
              population / 1000000
            ).toFixed(1)} million people</p>
            <p class="country__row"><span>🗣️</span>${langKeys}</p>
            <p class="country__row"><span>💰</span>${currencyData}</p>
          </div>
        </article>
        `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
};

const getJSON = async function (url, errorMsg = 'Something went wrong') {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${errorMsg} (${response.status})`);
  }
  return await response.json();
};

const getCountryData = function (country) {
  if (countryDataCache[country]) {
    renderCountry(countryDataCache[country]);
    return;
  }

  getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not found')
    .then(data => {
      countryDataCache[country] = data;
      renderCountry(data);

      const neighbour = data[0].borders?.[0];
      if (!neighbour) throw new Error('No neighbour country found!');

      return getJSON(
        `https://restcountries.com/v3.1/alpha/${neighbour}`,
        'Country not found'
      );
    })
    .then(data => {
      renderCountry(data, 'neighbour');
    })
    .catch(err => {
      console.error(`${err} 💥💥💥`);
      renderError(`Something went wrong 💥💥 ${err.message}. Try again!`);
    })
    .finally(() => (countriesContainer.style.opacity = 1));
};

btn.addEventListener('click', () => {
  getCountryData(countryName.value);
  countryName.value = '';
});
