import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { env } from '../utils/env';

test.describe('Login Tests', () => {

    test('Successful Login with Valid Credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await page.goto('/');

        await loginPage.openLoginModal();
        await loginPage.login(
            env.LOGIN_USERNAME,
            env.LOGIN_PASSWORD
        );

        await loginPage.clickLoginButton();
        await expect(page.locator('#nameofuser')).toHaveText(`Welcome ${env.LOGIN_USERNAME}`);
    });


    test('Unsuccessful Login with Invalid Credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await page.goto('/');

        await loginPage.openLoginModal();
        await loginPage.login(
            '!@#$',
            '!@#$'
        );

        await loginPage.clickLoginButton();
        await expect(loginPage.handleAlert()).resolves.toBe('Wrong password.');
    });
});
