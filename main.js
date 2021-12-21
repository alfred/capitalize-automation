const puppeteer = require('puppeteer');
const config    = require('./config');
const creds     = require('./credentials');

const CAPITALIZE_URLS = {
  HOME:      'https://www.hicapitalize.com/',
  CAREERS:   'careers/',
  TRUE_COST: 'resources/the-true-cost-of-forgotten-401ks/'
};

const trueCostRegex = /\d*\.\d+.\s*\w+/g;

async function clickAndNavigate({ page, link }) {
  return Promise.all([
    link.click(),
    page.waitForNavigation()
  ]);
};

async function clickFooterLink({ page, pageTitle }) {
  await page.goto( CAPITALIZE_URLS.HOME );

  const href      = `${ CAPITALIZE_URLS.HOME }${ CAPITALIZE_URLS[ pageTitle ] }`;
  const anchorSel = `#footer a[href="${ href }"]`;

  await page.waitForSelector( anchorSel );

  const hrefElem = await page.$( anchorSel );

  return clickAndNavigate({ link: hrefElem, page });
};

function toNumber( str ) {
  const units = {
    million: 10e6,
    trillion: 10e12
  };

  const [ num, unit ] = str.split(/\s+/);

  return +num * units[ unit ];
};

async function doCapitalizeWork() {
  const browser = await puppeteer.launch( config );
  const page    = await browser.newPage();

  await clickFooterLink({ page, pageTitle: 'CAREERS' });

  const elem   = await page.waitForSelector(`iframe#grnhse_iframe`);
  const iframe = await elem.contentFrame();

  await iframe.waitForSelector('.opening');

  const jobIWant = await iframe.$$eval(
    '.opening',
    divs => divs.map( el => {
      const anchor = el.querySelector('a');

      return {
        url: anchor.href,
        title: anchor.textContent
      };
    }).find(
      ({ title }) => title === 'Senior Full Stack Engineer'
    )
  );

  await page.goto( jobIWant.url );

  const screenshot = await page.screenshot({ encoding: 'base64' });

  const output = [
    `Title: ${ jobIWant.title }`,
    `URL: ${ jobIWant.url }`,
    `Screenshot (base64 encoded): ${ screenshot }`
  ].join('\n');

  console.log( output );

  await page.close();

  const trueCostPage = await browser.newPage();

  await clickFooterLink({ page: trueCostPage, pageTitle: 'TRUE_COST' });

  const subeadingSel   = '.elementor-text-editor > p:first-child';
  const subheadingEl   = await trueCostPage.waitForSelector( subeadingSel );
  const subheadingText = await subheadingEl.evaluate( el => el.textContent );

  const [
    accounts,
    amount
   ] = subheadingText
  .match( trueCostRegex )
  .map( toNumber );

  const trueCost = [
    'Number of Abandoned 401(k) accounts: ',
    accounts,
    'Estimated value of abandoned accounts: ',
    amount
  ].join('\n');

  console.log( trueCost );

  await browser.close();
};

async function doGitHubWork() {
  const browser = await puppeteer.launch( config );
  const page    = await browser.newPage();

  await page.goto('https://github.com/alfred/capitalize-automation');

  const signInSel = 'a[href^="/login"]';

  await page.waitForSelector( signInSel );

  const hrefElem = await page.$( signInSel );

  await clickAndNavigate({ link: hrefElem, page });

  await page.type( '#login_field', creds.username );
  await page.type( '#password', creds.password );

  const submitBtn = await page.$('#password ~ .btn[type="submit"]');

  await clickAndNavigate({ link: submitBtn, page });

  await page.waitForSelector('img.avatar');

  const display = await page.evaluate( () => {
    const starred = document.querySelector('.starred');
    return getComputedStyle( starred ).display;
  });

  if ( display === 'none' ) {
    const unstarredBtn = await page.$('.unstarred button');
    await unstarredBtn.click();
    await page.waitForSelector('.starred button');
  }

  await browser.close();
};

( async() => {
  await doCapitalizeWork();
  await doGitHubWork();
})();
