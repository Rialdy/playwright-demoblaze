import { Page } from 'playwright';
import { BasePage } from './basePage';
import { productLocators } from '../locators/productLocators';

export class ProductPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async addSamsungGalaxyS6ToCart(): Promise<void> {
        await this.click(productLocators.samsungGalaxyS6);
        const alertMessage = this.handleAlert();
        await this.click(productLocators.addToCartSamsungGalaxyS6);
        await alertMessage; 
        await this.click(productLocators.homeButton);        
    }

    async addNexus6ToCart(): Promise<void> {
        await this.click(productLocators.nexus6);
        const alertMessage = this.handleAlert();
        await this.click(productLocators.addToCartNexus6);
        await alertMessage; 
        await this.click(productLocators.homeButton);
    }

    async addIphone632gbToCart(): Promise<void> {
        await this.click(productLocators.iphone632gb);
        const alertMessage = this.handleAlert();
        await this.click(productLocators.addToCartIphone632gb);
        await alertMessage;
        await this.click(productLocators.homeButton);
    }

    async navigateToCart(): Promise<void> {
        await this.click(productLocators.cartButton);
    }
}