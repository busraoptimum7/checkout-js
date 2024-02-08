import React, { FunctionComponent, useEffect, useState } from 'react';

import { noop } from 'lodash';
import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';
import { Address, CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { ShippingProps, WithCheckoutShippingProps, mapToShippingProps } from '../../../core/src/app/shipping/Shipping';
import { withCheckout } from '../../../core/src/app/checkout';
import { SingleShippingFormValues } from '../../../core/src/app/shipping/SingleShippingForm';
import { isEqualAddress, mapAddressFromFormValues } from '../../../core/src/app/address';
import { UnassignItemError } from '../../../core/src/app/shipping/errors';
import { MultiShippingFormValues } from '../../../core/src/app/shipping/MultiShippingForm';
import ShippingForm from '../../../core/src/app/shipping/ShippingForm';
import ShippingHeader from '../../../core/src/app/shipping/ShippingHeader';
import StripeShipping from '../../../core/src/app/shipping/stripeUPE/StripeShipping';
import { getFFLProducts } from '../GraphQL';

import './style.scss';
import FFLDealers from './FFLDealers';


interface Opt7Props {
  isFFL: boolean;
  checkhoutId: string;
}

const OPT7Shipping: FunctionComponent<Opt7Props & ShippingProps & WithCheckoutShippingProps> = (props) => {
  const { cart, isBillingSameAsShipping, isGuest, shouldShowMultiShipping, customer, updateShippingAddress, initializeShippingMethod, deinitializeShippingMethod, isMultiShippingMode, step, isFloatingLabelEnabled, shouldRenderStripeForm, ...shippingFormProps } = props;
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [cartProds] = useState(props.cart.lineItems.physicalItems.map((item: any) => item.productId));
  const [fflProds, setFflProds] = useState<any[]>([]);
  const [nonFflProds, setNonFflProds] = useState<any[]>([]);
  const fflFilter = (item: any) => {
    return item.node.name === "Fire Arms"
  }
  useEffect(() => {
    if (props.isFFL) {
      const fetchProd = async () => {
        //@ts-ignore
        const prods = await getFFLProducts(cartProds,window.storefront_api);

        const products = prods.data.site.products.edges;
        products.forEach((element: any) => {
          if (element.node.customFields.edges.filter(fflFilter).length) {
            element.node.customFields.edges.filter(fflFilter).forEach((item: any) => {
              if (item.node.value === 'true') {
               setFflProds((prev: any[]) => [...prev, element])
              }
              else {
                setNonFflProds((prev: any[]) => [...prev, element])
              }
            });

          } else {

            setNonFflProds((prev: any[]) => [...prev, element])
          }

        });
      };

      fetchProd();
      setLoading(false);
      setIsInitializing(false);
    } else {
      setLoading(false);
      setIsInitializing(false);
    }
  }, [props.isFFL]);

  const handleMultiShippingModeSwitch: () => void = async () => {
    const { consignments, isMultiShippingMode, onToggleMultiShipping = noop, onUnhandledError = noop, updateShippingAddress } = props;

    if (isMultiShippingMode && consignments.length > 1) {
      setIsInitializing(true);

      try {
        // Collapse all consignments into one
        await updateShippingAddress(consignments[0].shippingAddress);
      } catch (error) {
        onUnhandledError(error);
      } finally {
        setIsInitializing(false);
      }
    }

    onToggleMultiShipping();
  };

  const handleSingleShippingSubmit: (values: SingleShippingFormValues) => void = async ({ billingSameAsShipping, shippingAddress: addressValues, orderComment }) => {
    const { customerMessage, updateCheckout, updateShippingAddress, updateBillingAddress, navigateNextStep, onUnhandledError, shippingAddress, billingAddress, methodId } = props;

    const updatedShippingAddress = addressValues && mapAddressFromFormValues(addressValues);
    const promises: Array<Promise<CheckoutSelectors>> = [];
    const hasRemoteBill = hasRemoteBilling(methodId);

    if (!isEqualAddress(updatedShippingAddress, shippingAddress) || shippingAddress?.shouldSaveAddress !== updatedShippingAddress?.shouldSaveAddress) {
      promises.push(updateShippingAddress(updatedShippingAddress || {}));
    }

    if (billingSameAsShipping && updatedShippingAddress && !isEqualAddress(updatedShippingAddress, billingAddress) && !hasRemoteBill) {
      promises.push(updateBillingAddress(updatedShippingAddress));
    }

    if (customerMessage !== orderComment) {
      promises.push(updateCheckout({ customerMessage: orderComment }));
    }

    try {
      await Promise.all(promises);

      navigateNextStep(billingSameAsShipping);
    } catch (error) {
      if (error instanceof Error) {
        onUnhandledError(error);
      }
    }
  };

  const hasRemoteBilling: (methodId?: string) => boolean = (methodId) => {
    const PAYMENT_METHOD_VALID = ['amazonpay'];

    return PAYMENT_METHOD_VALID.some((method) => method === methodId);
  };

  const handleUseNewAddress: (address: Address, itemId: string) => void = async (address, itemId) => {
    const { unassignItem, onUnhandledError } = props;

    try {
      await unassignItem({
        address,
        lineItems: [
          {
            quantity: 1,
            itemId,
          },
        ],
      });

      location.href = '/account.php?action=add_shipping_address&from=checkout';
    } catch (error) {
      if (error instanceof UnassignItemError) {
        onUnhandledError(new UnassignItemError(error));
      }
    }
  };

  const handleMultiShippingSubmit: (values: MultiShippingFormValues) => void = async ({ orderComment }) => {
    const { customerMessage, updateCheckout, navigateNextStep, onUnhandledError } = props;

    try {
      if (customerMessage !== orderComment) {
        await updateCheckout({ customerMessage: orderComment });
      }

      navigateNextStep(false);
    } catch (error) {
      if (error instanceof Error) {
        onUnhandledError(error);
      }
    }
  };

  //console.log(nonFflProds.length,fflProds.length);

  if (loading) {

    return (
      <AddressFormSkeleton />
    )

  } else if (fflProds.length > 0 && nonFflProds.length > 0) {

    return (
      <>
        <FFLDealers fflProducts={fflProds} />
        <div className='opt7-ffl-container'>
          <div className='opt7-ffl-dealer-container'>
            <div className='opt7-ffl-dealer-title'>
              <h4>2. Shipping options for other products</h4>
            </div>
            <div className='opt7-ffl-products'>
              <div className='opt7-ffl-products-list'>
                {
                  nonFflProds.map((item: any, index: number) => (
                    <div className='opt7-ffl-product' key={`ffl-prods-${index}`}>
                      <div className='product-img'>
                        <img src={item.node.defaultImage.urlOriginal} />
                      </div>
                      <div className='product-detail'>
                        <p className='product-name'>{item.node.name}</p>
                        <div className='product-sale-area'>
                          {/* <p className='product-qty'>Quantity: {cart.lineItems.physicalItems.filter(i => i.productId === item.entityId)[0].quantity}</p> */}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className='opt7-ffl-dealer-body'>
              <AddressFormSkeleton isLoading={isInitializing}>
                <div className="checkout-form">
                  <ShippingForm
                    {...shippingFormProps}
                    addresses={customer.addresses}
                    deinitialize={deinitializeShippingMethod}
                    initialize={initializeShippingMethod}
                    isBillingSameAsShipping={isBillingSameAsShipping}
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    isGuest={isGuest}
                    isMultiShippingMode={false}
                    onMultiShippingSubmit={handleMultiShippingSubmit}
                    onSingleShippingSubmit={handleSingleShippingSubmit}
                    onUseNewAddress={handleUseNewAddress}
                    shouldShowSaveAddress={!isGuest}
                    updateAddress={updateShippingAddress}
                    cart={cart}
                  />
                </div>
              </AddressFormSkeleton>
            </div>
          </div>
        </div>
      </>
    )

  } else if (fflProds.length > 0 && nonFflProds.length === 0) {

    return (
      <FFLDealers fflProducts={fflProds} />
    )

  } else {

    if (shouldRenderStripeForm && !customer.email && props.countries.length > 0) {
      return <StripeShipping
        {...shippingFormProps}
        customer={customer}
        deinitialize={deinitializeShippingMethod}
        initialize={initializeShippingMethod}
        isBillingSameAsShipping={isBillingSameAsShipping}
        isGuest={isGuest}
        isLoading={isInitializing}
        isMultiShippingMode={isMultiShippingMode}
        isShippingMethodLoading={props.isLoading}
        onMultiShippingChange={handleMultiShippingModeSwitch}
        onSubmit={handleSingleShippingSubmit}
        shouldShowMultiShipping={shouldShowMultiShipping}
        step={step}
        updateAddress={updateShippingAddress}
      />;
    }

    return (
      <AddressFormSkeleton isLoading={isInitializing}>
        <div className="checkout-form">
          <ShippingHeader
            isGuest={isGuest}
            isMultiShippingMode={isMultiShippingMode}
            onMultiShippingChange={handleMultiShippingModeSwitch}
            shouldShowMultiShipping={shouldShowMultiShipping}
          />
          <ShippingForm
            {...shippingFormProps}
            addresses={customer.addresses}
            deinitialize={deinitializeShippingMethod}
            initialize={initializeShippingMethod}
            isBillingSameAsShipping={isBillingSameAsShipping}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            isGuest={isGuest}
            isMultiShippingMode={false}
            onMultiShippingSubmit={handleMultiShippingSubmit}
            onSingleShippingSubmit={handleSingleShippingSubmit}
            onUseNewAddress={handleUseNewAddress}
            shouldShowSaveAddress={!isGuest}
            updateAddress={updateShippingAddress}
            cart={cart}
          />
        </div>
      </AddressFormSkeleton>
    );

  }
}

// const deleteConsignmentsSelector = createSelector(
//   ({ checkoutService: { deleteConsignment } }: CheckoutContextProps) => deleteConsignment,
//   ({ checkoutState: { data } }: CheckoutContextProps) => data.getConsignments(),
//   (deleteConsignment, consignments) => async () => {
//     if (!consignments || !consignments.length) {
//       return;
//     }

//     const [{ data }] = await Promise.all(consignments.map(({ id }) => deleteConsignment(id)));

//     return data.getShippingAddress();
//   },
// );

export default withCheckout(mapToShippingProps)(OPT7Shipping);
