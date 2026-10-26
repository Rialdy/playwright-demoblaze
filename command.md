# run Chrome and Firefox
npx playwright test tests/login.spec.ts

# run Chrome browser
npx playwright test tests/login.spec.ts --project=chromium 

# run Firefox browser
npx playwright test tests/login.spec.ts --project=firefox

