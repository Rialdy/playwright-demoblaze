import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { ProductPage } from '../pages/productPage';
import { CartPage } from '../pages/cartPage';
import { PlaceOrderPage } from '../pages/placeOrderPage';
import { env } from '../utils/env';

test.describe.configure({ mode: 'serial' });

test.describe('Checkout Flow', () => {

    // Login Before Each Test
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        const cartPage = new CartPage(page);

        await page.goto('/');
        await loginPage.openLoginModal();
        await loginPage.login(env.LOGIN_USERNAME, env.LOGIN_PASSWORD);
        await loginPage.clickLoginButton();

        await expect(page.locator('#nameofuser')).toHaveText(`Welcome ${env.LOGIN_USERNAME}`, { timeout: 20000 });

        // Cart is stored server-side per account; reset it so totals are deterministic
        await cartPage.clearCart(env.LOGIN_USERNAME);
    });

    test('Successful Checkout Process', async ({ page }) => {
        const productPage = new ProductPage(page);
        const cartPage = new CartPage(page);
        const placeOrderPage = new PlaceOrderPage(page);

        // Navigate to Product Page and Add Product to Cart
        await productPage.addSamsungGalaxyS6ToCart();
        await productPage.addNexus6ToCart();
        await productPage.addIphone632gbToCart();

        // Navigate to Cart Page
        await productPage.navigateToCart();

        // Validate items in cart
        await expect(cartPage.samsungGalaxyS6).toBeVisible();
        await expect(cartPage.nexus6).toBeVisible();
        await expect(cartPage.iphone632gb).toBeVisible();

        // Validate Total Price
        await expect(cartPage.totalPrice).toHaveText('1800');

        // Click Place Order Button
        await cartPage.clickPlaceOrderButton();

        // Fill in Place Order Form
        await placeOrderPage.inputName('John Doe');
        await placeOrderPage.creditCardNumber('1234 5678 9012 3456');

        // Click Purchase Button
        await placeOrderPage.clickPurchaseButton();

        // Validate Thank You Message
        await expect(placeOrderPage.thankYouMessage).toHaveText('Thank you for your purchase!');
    });
});
