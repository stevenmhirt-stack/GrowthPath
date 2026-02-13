import { getUncachableStripeClient } from '../server/stripeClient';

async function seedProducts() {
  console.log('Creating GrowthPath Premium product and prices...');

  const stripe = await getUncachableStripeClient();

  const existingProducts = await stripe.products.list({ active: true });
  let product = existingProducts.data.find(p => p.name === 'GrowthPath Premium');

  if (!product) {
    product = await stripe.products.create({
      name: 'GrowthPath Premium',
      description: 'Unlock Assessment, Routines, and Daily Planner features',
      metadata: {
        app: 'growthpath',
      },
    });
    console.log(`Created product: ${product.id}`);
  } else {
    console.log(`Product already exists: ${product.id}`);
  }

  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
  });

  const monthlyPrice = existingPrices.data.find(
    p => p.recurring?.interval === 'month' && p.unit_amount === 1099
  );
  const yearlyPrice = existingPrices.data.find(
    p => p.recurring?.interval === 'year' && p.unit_amount === 9900
  );

  if (!monthlyPrice) {
    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 1099,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'monthly',
      },
    });
    console.log(`Created monthly price: ${monthly.id} ($10.99/month)`);
  } else {
    console.log(`Monthly price already exists: ${monthlyPrice.id}`);
  }

  if (!yearlyPrice) {
    const yearly = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900,
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan: 'yearly',
      },
    });
    console.log(`Created yearly price: ${yearly.id} ($99.00/year)`);
  } else {
    console.log(`Yearly price already exists: ${yearlyPrice.id}`);
  }

  console.log('Stripe products seeded successfully!');
}

seedProducts().catch(console.error);
